<?php

namespace App\Http\Controllers\Api\V1\Principal;

use App\Helpers\AuthContext;
use App\Http\Controllers\Controller;
use App\Models\AttendanceDay;
use App\Models\Memo;
use App\Models\Section;
use App\Models\TimetableEntry;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RhythmController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $today = Carbon::today()->toDateString();
        $date = $request->query('date', $today);

        // Get sections in scope
        $branchIds = AuthContext::allowedBranchIds();
        $sections = Section::whereHas('grade', function ($q) use ($branchIds) {
            $q->whereIn('branch_id', $branchIds);
        })->with('grade')->get();

        // 1. Attendance
        $submittedSectionIds = AttendanceDay::whereIn('section_id', $sections->pluck('id'))
            ->where('attendance_date', $date)
            ->where('status', 'SUBMITTED')
            ->pluck('section_id')
            ->toArray();

        $attendanceCompletion = $sections->map(function ($section) use ($submittedSectionIds) {
            return [
                'section_id' => $section->id,
                'section_name' => $section->grade->name . ' - ' . $section->name,
                'status' => in_array($section->id, $submittedSectionIds) ? 'SUBMITTED' : 'MISSING'
            ];
        });

        $submittedCount = count($submittedSectionIds);
        $totalSections = $sections->count();
        $percentComplete = $totalSections > 0 ? round(($submittedCount / $totalSections) * 100) : 0;

        // 2. Timetable
        $sectionsWithEntries = TimetableEntry::query()
            ->whereIn('section_id', $sections->pluck('id'))
            ->select('section_id')
            ->distinct()
            ->pluck('section_id')
            ->toArray();

        $timetableCoverage = $sections->map(function ($section) use ($sectionsWithEntries) {
            return [
                'section_id' => $section->id,
                'section_name' => $section->grade->name . ' - ' . $section->name,
                'status' => in_array($section->id, $sectionsWithEntries) ? 'CONFIGURED' : 'MISSING'
            ];
        });

        // 3. Memos - Simplified for MVP
        // Count memos published today by logic (approximately, since query is scope-based)
        // We just count memos created by this user or global count for metrics?
        // Principal wants "System Pulse". 
        // Let's count Memos published today visible to global scope or created by anyone (Principal sees all usually if admin)
        // Assume Principal sees all memos in their branch scope.
        // Simplified query:
        $memosPublishedToday = Memo::whereNotNull('published_at')
            ->whereDate('published_at', $today)
            ->where(function ($q) use ($branchIds) {
                foreach ($branchIds as $bid) {
                    $q->orWhereJsonContains('scope_json->branch_ids', $bid);
                }
            })
            ->count();

        // Pending Ack (Personal)
        // Or if we want Global Pending Acks (Heavy query usually).
        // Let's return Principal's pending acks.
        // Pending Global Count for *Parents*?
        // Maybe "Memos requiring ack total" vs "Total Acks".
        // Let's stick to simple "Memos Published Today" for now to avoid perf hit.

        // 4. Assignments Metrics
        $assignmentsDueSoon = \App\Models\Assignment::whereBetween('due_at', [now(), now()->addDays(7)])
            ->whereIn('branch_id', $branchIds)
            ->count();

        $assignmentsPublishedToday = \App\Models\Assignment::whereDate('published_at', $today)
            ->whereIn('branch_id', $branchIds)
            ->count();

        // 5. Exams Metrics
        $upcomingExams = \App\Models\Exam::where('exam_date', '>=', $today)
            ->where('exam_date', '<=', Carbon::parse($today)->addDays(14))
            ->whereIn('branch_id', $branchIds)
            ->count();

        // 6. Tickets Metrics
        $openTickets = \App\Models\Ticket::whereIn('branch_id', $branchIds)
            ->where('status', 'OPEN')
            ->count();
        $highPriorityOpen = \App\Models\Ticket::whereIn('branch_id', $branchIds)
            ->where('status', 'OPEN')
            ->where('priority', 'HIGH')
            ->count();

        return response()->json([
            'today' => $date,
            'attendance_completion' => $attendanceCompletion,
            'attendance_summary' => [
                'total' => $totalSections,
                'submitted' => $submittedCount,
                'missing' => $attendanceCompletion->where('status', 'MISSING')->count(),
                'percent' => $percentComplete
            ],
            'timetable_coverage' => $timetableCoverage,
            'memos_pending_ack_count' => 0,
            'memos_published_today' => $memosPublishedToday,
            'assignments_published_today' => $assignmentsPublishedToday,
            'assignments_due_next_7_days' => $assignmentsDueSoon,
            'upcoming_exams_next_14_days' => $upcomingExams,
            'tickets_open' => $openTickets,
            'tickets_high_priority_open' => $highPriorityOpen,
            'notes' => [
                "Attendance: $submittedCount/$totalSections sections submitted",
                "Memos Today: $memosPublishedToday",
                "Exams Next 2 Weeks: $upcomingExams",
                "Open Tickets: $openTickets"
            ]
        ]);
    }
}
