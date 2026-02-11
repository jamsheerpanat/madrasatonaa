<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AttendanceDay;
use App\Models\AttendanceRecord;
use App\Models\Section;
use App\Services\AttendanceDayService;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class AttendanceController extends Controller
{
    protected $service;

    public function __construct(AttendanceDayService $service)
    {
        $this->service = $service;
    }

    // GET /attendance/section/{sectionId}/day?date=2025-02-14
    public function getDay(Request $request, int $sectionId)
    {
        $request->validate(['date' => 'required|date']);
        $date = $request->query('date');

        $day = $this->service->getOrCreateAttendanceDay($sectionId, $date);

        // Transform records
        $day->records->transform(function ($r) {
            if ($r->student) {
                $r->student_name = $r->student->full_name;
                $r->student_code = $r->student->student_code;
                $r->student_image = $r->student->profile_image;
                // Keep minimal student info if needed, but for now we flatten
                unset($r->student);
            }
            return $r;
        });

        // Add summary stats
        $stats = $day->records->groupBy('status')->map->count();
        $allStatuses = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'];
        foreach ($allStatuses as $s) {
            if (!isset($stats[$s]))
                $stats[$s] = 0;
        }
        $day->stats = $stats;

        return response()->json($day);
    }

    public function createDay(Request $request, int $sectionId)
    {
        $request->validate(['date' => 'required|date']);
        $date = $request->input('date');

        // Reuse get or create logic
        $day = $this->service->getOrCreateAttendanceDay($sectionId, $date);

        // Transform records
        $day->records->transform(function ($r) {
            if ($r->student) {
                $r->student_name = $r->student->full_name;
                $r->student_code = $r->student->student_code;
                $r->student_image = $r->student->profile_image;
                unset($r->student);
            }
            return $r;
        });

        return response()->json($day);
    }

    // GET /attendance/stats
    public function getStats(Request $request)
    {
        $date = $request->query('date', now()->toDateString());
        $user = $request->user();

        $query = AttendanceRecord::whereHas('attendanceDay', function ($q) use ($date, $user) {
            $q->whereDate('attendance_date', $date);

            // Scope to teacher's class if they are not a principal/admin
            if ($user->user_type === 'STAFF' && !$user->can('principal.dashboard.view')) {
                $q->whereHas('section', function ($sq) use ($user) {
                    $sq->where('class_teacher_id', $user->id);
                });
            }
        });

        $stats = $query->selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        $allStatuses = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'];
        $result = [];
        foreach ($allStatuses as $s) {
            $result[strtolower($s)] = $stats[$s] ?? 0;
        }
        $result['total'] = array_sum($result);

        return response()->json($result);
    }

    // PUT /day/{id}/mark
    public function markDay(Request $request, int $id)
    {
        // Permission check
        // Auth Scope check (branch)

        $request->validate([
            'marks' => 'required|array',
            'marks.*.student_id' => 'required|exists:students,id',
            'marks.*.status' => 'required|in:PRESENT,ABSENT,LATE,EXCUSED,EARLY_LEAVE',
            'marks.*.note' => 'nullable|string'
        ]);

        $day = $this->service->markAttendance(
            $id,
            $request->input('marks'),
            auth()->id() // Assuming User Auth
        );

        $day->records->transform(function ($r) {
            if ($r->student) {
                $r->student_name = $r->student->full_name;
                $r->student_code = $r->student->student_code;
                $r->student_image = $r->student->profile_image;
                unset($r->student);
            }
            return $r;
        });

        return response()->json($day);
    }

    // POST /day/{id}/submit
    public function submitDay(Request $request, int $id)
    {
        // Check permission if teacher can submit

        $day = $this->service->submitAttendance($id, auth()->id());

        $day->records->transform(function ($r) {
            if ($r->student) {
                $r->student_name = $r->student->full_name;
                $r->student_code = $r->student->student_code;
                $r->student_image = $r->student->profile_image;
                unset($r->student);
            }
            return $r;
        });

        return response()->json(['message' => 'Attendance submitted successfully.', 'data' => $day]);
    }

    // GET /attendance/child/{studentId?}/month
    public function getChildMonth(Request $request, ?int $studentId = null)
    {
        $user = $request->user();

        // If no studentId, try to get it from current user if they are a student
        if (!$studentId && $user->user_type === 'STUDENT') {
            $studentId = $user->student?->id;
        }

        if (!$studentId) {
            return response()->json(['message' => 'Student ID required'], 400);
        }

        // Security check: If student, they can only see their own
        if ($user->user_type === 'STUDENT' && $user->student?->id != $studentId) {
            return response()->json(['message' => 'Access Denied'], 403);
        }

        $start = now()->startOfMonth()->toDateString();
        $end = now()->endOfMonth()->toDateString();

        $records = AttendanceRecord::where('student_id', $studentId)
            ->whereHas('attendanceDay', function ($q) use ($start, $end) {
                $q->whereBetween('attendance_date', [$start, $end])
                    ->where('status', 'SUBMITTED');
            })
            ->with(['attendanceDay', 'justification'])
            ->get()
            ->sortByDesc(function ($record) {
                return $record->attendanceDay->attendance_date->timestamp;
            })
            ->values();

        return response()->json($records->map(function ($r) {
            return [
                'record_id' => $r->id,
                'date' => $r->attendanceDay?->attendance_date?->toDateString(),
                'status' => $r->status,
                'justification_status' => $r->justification?->status,
                'note' => $r->note
            ];
        }));
    }

    // POST /parent/justify
    public function submitJustification(Request $request)
    {
        $request->validate([
            'attendance_record_id' => 'required|exists:attendance_records,id',
            'justification_text' => 'required|string',
        ]);

        $user = auth()->user();
        $guardian = $user->guardian;

        if (!$guardian) {
            return response()->json(['message' => 'Only guardians can submit justifications.'], 403);
        }

        $justification = \App\Models\AttendanceJustification::create([
            'attendance_record_id' => $request->attendance_record_id,
            'guardian_id' => $guardian->id,
            'justification_text' => $request->justification_text,
            'status' => 'PENDING',
        ]);

        return response()->json(['message' => 'Justification submitted.', 'data' => $justification]);
    }

    // POST /justifications/{id}/review
    public function reviewJustification(Request $request, int $id)
    {
        $request->validate([
            'status' => 'required|in:APPROVED,REJECTED',
            'review_note' => 'nullable|string'
        ]);

        $justification = \App\Models\AttendanceJustification::findOrFail($id);
        $justification->update([
            'status' => $request->status,
            'reviewed_by_user_id' => auth()->id(),
            'reviewed_at' => now(),
        ]);

        return response()->json(['message' => 'Justification review complete.', 'data' => $justification]);
    }
}
