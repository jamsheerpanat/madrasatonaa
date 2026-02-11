<?php

namespace App\Services;

use App\Models\AttendanceDay;
use App\Models\AttendanceRecord;
use App\Models\Enrollment;
use App\Models\NotificationEvent;
use App\Models\Section;
use App\Models\Student;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AttendanceDayService
{
    protected $timelineEmitter;

    public function __construct(TimelineEmitter $timelineEmitter)
    {
        $this->timelineEmitter = $timelineEmitter;
    }

    public function getOrCreateAttendanceDay(int $sectionId, string $date)
    {
        // Parse date carefully
        $carbonDate = \Illuminate\Support\Carbon::parse($date);
        $normalizedDate = $carbonDate->toDateString();

        $day = AttendanceDay::where('section_id', $sectionId)
            ->whereDate('attendance_date', $normalizedDate)
            ->with(['records.student', 'records.justification'])
            ->first();

        if (!$day) {
            $section = Section::with('grade')->findOrFail($sectionId);

            DB::transaction(function () use ($section, $normalizedDate, &$day) {
                $day = AttendanceDay::create([
                    'branch_id' => $section->grade->branch_id,
                    'section_id' => $section->id,
                    'attendance_date' => $normalizedDate,
                    'status' => 'DRAFT',
                ]);

                // Auto-build records
                $this->buildRecords($day);
            });

            // Reload with relations
            $day = AttendanceDay::where('id', $day->id)
                ->with(['records.student', 'records.justification'])
                ->first();
        }

        return $day;
    }

    protected function buildRecords(AttendanceDay $day)
    {
        // Get active students in this section
        $studentIds = Enrollment::where('section_id', $day->section_id)
            ->where('status', 'ACTIVE')
            ->pluck('student_id');

        $records = [];
        $now = now();
        foreach ($studentIds as $id) {
            $records[] = [
                'attendance_day_id' => $day->id,
                'student_id' => $id,
                'status' => 'PRESENT', // Default to Present
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        if (!empty($records)) {
            AttendanceRecord::insert($records);
        }
    }

    public function markAttendance(int $attendanceDayId, array $marks, int $userId)
    {
        $day = AttendanceDay::findOrFail($attendanceDayId);

        if ($day->status === 'SUBMITTED') {
            // Allow updates if user has special permission (e.g. Admin), 
            // but for now we'll stick to basic rule: if submitted, unlock first? 
            // Or just allow overwrite with log. 
            // Let's allow overwrite but log it.
            // throw ValidationException::withMessages(['status' => 'Attendance already submitted.']);
        }

        return DB::transaction(function () use ($day, $marks, $userId) {
            foreach ($marks as $mark) {
                AttendanceRecord::where('attendance_day_id', $day->id)
                    ->where('student_id', $mark['student_id'])
                    ->update([
                        'status' => $mark['status'],
                        'note' => $mark['note'] ?? null,
                        'updated_at' => now()
                    ]);
            }

            $day->update([
                'marked_by_user_id' => $userId,
                'updated_at' => now()
            ]);

            return $day->load('records.student');
        });
    }

    public function submitAttendance(int $attendanceDayId, int $userId)
    {
        $day = AttendanceDay::with(['section.grade', 'records.student'])->findOrFail($attendanceDayId);

        if ($day->status === 'SUBMITTED') {
            // Already submitted, maybe just re-notify or ignore?
            // Let's re-submit to allow corrections + notification re-send
        }

        DB::transaction(function () use ($day, $userId) {
            $day->update([
                'status' => 'SUBMITTED',
                'submitted_at' => now(),
                'marked_by_user_id' => $userId,
            ]);

            // 1. Stats Calculation
            $stats = $day->records->groupBy('status')->map->count();

            // 2. Timeline Event (Principal Dashboard)
            $this->timelineEmitter->emitForSection(
                $day->section_id,
                $day->branch_id,
                'AttendanceSubmitted',
                'Attendance Marked',
                [
                    'section_name' => $day->section->name,
                    'grade_name' => $day->section->grade->name,
                    'date' => $day->attendance_date,
                    'stats' => $stats
                ]
            );

            // 3. Notify Parents of Absentees
            $this->notifyParents($day);
        });

        return $day;
    }

    protected function notifyParents(AttendanceDay $day)
    {
        // Filter for Absentees or Late
        $absentees = $day->records->filter(fn($r) => in_array($r->status, ['ABSENT', 'LATE']));

        foreach ($absentees as $record) {
            // Find Guardian User
            // Logic: Student -> Guardian -> User
            // Ideally we emit a 'NotificationEvent' which a worker processes.

            // Mocking the Notification Creation
            NotificationEvent::create([
                'event_key' => 'student.attendance.' . strtolower($record->status),
                'branch_id' => $day->branch_id,
                'section_id' => $day->section_id,
                'student_id' => $record->student_id,
                'actor_user_id' => $day->marked_by_user_id,
                'payload_json' => [
                    'student_name' => $record->student->full_name,
                    'date' => $day->attendance_date,
                    'status' => $record->status,
                    'message' => "Your child {$record->student->full_name} is marked {$record->status} today ({$day->attendance_date})."
                ]
            ]);

            // Also emit dedicated Timeline Event for the Student Scope (Parent view)
            $this->timelineEmitter->emitForStudent(
                $record->student_id,
                $day->section_id,
                $day->branch_id,
                'AttendanceIncident',
                "{$record->student->full_name} marked {$record->status}",
                [
                    'status' => $record->status,
                    'date' => $day->attendance_date,
                    'note' => $record->note
                ]
            );
        }
    }
}
