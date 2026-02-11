<?php

namespace App\Services;

use App\Models\Section;
use App\Models\TimetableEntry;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class TimetableService
{
    protected $timelineEmitter;
    protected $periodService;

    public function __construct(TimelineEmitter $timelineEmitter, PeriodTemplateService $periodService)
    {
        $this->timelineEmitter = $timelineEmitter;
        $this->periodService = $periodService;
    }

    protected function sortEntries($entries)
    {
        $dayOrder = [
            'SUN' => 1,
            'MON' => 2,
            'TUE' => 3,
            'WED' => 4,
            'THU' => 5,
            'FRI' => 6,
            'SAT' => 7
        ];

        return $entries->sortBy(function ($entry) use ($dayOrder) {
            return ($dayOrder[$entry->day_of_week] ?? 8) * 100 + $entry->period_no;
        })->values();
    }

    public function getSectionTimetable(int $sectionId)
    {
        $entries = TimetableEntry::where('section_id', $sectionId)
            ->with(['subject', 'teacher'])
            ->get();

        return $this->sortEntries($entries);
    }

    public function getTeacherTimetable(int $teacherUserId)
    {
        $entries = TimetableEntry::where('teacher_user_id', $teacherUserId)
            ->with(['subject', 'section.grade'])
            ->get();

        return $this->sortEntries($entries);
    }

    public function upsertSectionTimetable(int $sectionId, array $entries)
    {
        $section = Section::with('grade.branch')->findOrFail($sectionId);
        $branchId = $section->grade->branch_id;

        $template = $this->periodService->getActiveTemplate($branchId);
        $maxPeriods = $template ? $template->periods_per_day : 8;

        return DB::transaction(function () use ($section, $branchId, $entries, $maxPeriods) {

            // Conflict Check: Check if any teacher is booked in ANOTHER section at the SAME time
            foreach ($entries as $entry) {
                if (empty($entry['teacher_user_id']))
                    continue;

                $conflicts = TimetableEntry::where('teacher_user_id', $entry['teacher_user_id'])
                    ->where('day_of_week', $entry['day_of_week'])
                    ->where('period_no', $entry['period_no'])
                    ->where('section_id', '!=', $section->id)
                    ->with('section')
                    ->first();

                if ($conflicts) {
                    $teacher = \App\Models\User::find($entry['teacher_user_id']);
                    throw ValidationException::withMessages([
                        'conflicts' => "Teacher {$teacher->full_name} is already booked in {$conflicts->section->name} on {$entry['day_of_week']} period {$entry['period_no']}."
                    ]);
                }
            }

            TimetableEntry::where('section_id', $section->id)->delete();

            $newEntries = [];
            foreach ($entries as $entry) {
                if ($entry['period_no'] > $maxPeriods) {
                    throw ValidationException::withMessages(['period_no' => "Period {$entry['period_no']} exceeds limit ($maxPeriods)"]);
                }

                $newEntries[] = [
                    'branch_id' => $branchId,
                    'section_id' => $section->id,
                    'day_of_week' => $entry['day_of_week'],
                    'period_no' => $entry['period_no'],
                    'subject_id' => $entry['subject_id'],
                    'teacher_user_id' => $entry['teacher_user_id'] ?? null,
                    'room_name' => $entry['room_name'] ?? null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }

            if (!empty($newEntries)) {
                TimetableEntry::insert($newEntries);
            }

            $this->timelineEmitter->emitForSection(
                $section->id,
                $branchId,
                'TimetableUpdated',
                "Timetable updated",
                ['section_id' => $section->id, 'updated_count' => count($newEntries)]
            );

            return $this->getSectionTimetable($section->id);
        });
    }
}
