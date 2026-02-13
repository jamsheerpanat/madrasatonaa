<?php

namespace App\Services;

use App\Models\Exam;
use App\Models\Term;
use App\Models\User;
use App\Services\TimelineEmitter;
use Carbon\Carbon;

class ExamService
{
    protected $timeline;

    public function __construct(TimelineEmitter $timeline)
    {
        $this->timeline = $timeline;
    }

    public function scheduleExam(array $data, User $creator)
    {
        // data: { section_id, subject_id, term_id, exam_type, exam_date, max_grade }
        // Verify Branch match?
        $branchId = $creator->roles()->first()?->pivot->branch_id ?? 1;

        $exam = Exam::create(array_merge($data, [
            'branch_id' => $branchId,
            'created_by_user_id' => $creator->id
        ]));

        $this->timeline->emitForSection(
            $exam->section_id,
            $exam->branch_id,
            'ExamScheduled',
            "{$exam->exam_type} scheduled",
            ['exam_id' => $exam->id, 'date' => $exam->exam_date->toDateString()]
        );

        return $exam;
    }

    public function listForSection(int $sectionId, int $termId)
    {
        return Exam::where('section_id', $sectionId)
            ->where('term_id', $termId)
            ->with(['subject'])
            ->orderBy('exam_date')
            ->get();
    }
}
