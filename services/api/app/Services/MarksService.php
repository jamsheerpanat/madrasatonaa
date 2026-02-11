<?php

namespace App\Services;

use App\Models\Exam;
use App\Models\ExamMark;
use App\Models\User;
use App\Services\TimelineEmitter;
use Illuminate\Support\Facades\DB;

class MarksService
{
    protected $timeline;

    public function __construct(TimelineEmitter $timeline)
    {
        $this->timeline = $timeline;
    }

    public function upsertMarks(Exam $exam, array $marksData, User $updater)
    {
        DB::transaction(function () use ($exam, $marksData, $updater) {
            foreach ($marksData as $row) {
                // $row: { student_id, grade_letter, remarks, skill_ratings }

                // Validate student enrollment? Assume checked by Controller or implicit.
                // Strict check:
                // if (!Enrollment::isActiveIn($row['student_id'], $exam->section_id)) continue;

                ExamMark::updateOrCreate(
                    ['exam_id' => $exam->id, 'student_id' => $row['student_id']],
                    [
                        'grade_letter' => $row['grade_letter'],
                        'remarks' => $row['remarks'] ?? null,
                        'skill_ratings_json' => $row['skill_ratings_json'] ?? null,
                        'updated_by_user_id' => $updater->id
                    ]
                );
            }
        });

        // Timeline
        $this->timeline->emitForSection(
            $exam->section_id,
            $exam->branch_id,
            'MarksUpdated',
            "Marks updated for {$exam->exam_type}",
            ['exam_id' => $exam->id, 'count' => count($marksData)]
        );

        return true;
    }
}
