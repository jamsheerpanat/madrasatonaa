<?php

namespace App\Services;

use App\Models\Assignment;
use App\Models\Submission;
use App\Models\User;

class SubmissionService
{
    protected $timeline;

    public function __construct(TimelineEmitter $timeline)
    {
        $this->timeline = $timeline;
    }

    public function submit(Assignment $assignment, int $studentId, User $actor, array $data)
    {
        // Check uniqueness constraint
        $existing = Submission::where('assignment_id', $assignment->id)
            ->where('student_id', $studentId)
            ->first();

        if ($existing) {
            // For MVP, simplistic update or error. Let's error to be safe as per spec "one active submission"
            // Or better, update it.
            // Spec says "Unique constraint".
            abort(409, 'Already submitted');
        }

        $submission = Submission::create([
            'assignment_id' => $assignment->id,
            'student_id' => $studentId,
            'submitted_by_user_id' => $actor->user_type !== 'PARENT' ? $actor->id : null,
            'submitted_by_guardian_id' => $actor->user_type === 'PARENT' ? $actor->guardian?->id : null,
            'submission_text' => $data['submission_text'] ?? null,
            'submitted_at' => now(),
            'status' => 'SUBMITTED'
        ]);

        if (!empty($data['attachments'])) {
            $submission->attachments()->createMany($data['attachments']);
        }

        $this->timeline->emitForStudent(
            $studentId,
            $assignment->section_id,
            $assignment->branch_id,
            'SubmissionReceived',
            "Submitted: {$assignment->title_en}",
            ['submission_id' => $submission->id, 'assignment_id' => $assignment->id]
        );

        return $submission;
    }

    public function grade(Submission $submission, array $data, User $grader)
    {
        $submission->update([
            'grade_value' => $data['grade_value'],
            'feedback' => $data['feedback'],
            'graded_by_user_id' => $grader->id,
            'graded_at' => now(),
            'status' => 'GRADED'
        ]);

        $this->timeline->emitForStudent(
            $submission->student_id,
            $submission->assignment->section_id,
            $submission->assignment->branch_id,
            'SubmissionGraded',
            "Graded: {$submission->assignment->title_en}",
            ['grade' => $data['grade_value'], 'submission_id' => $submission->id]
        );

        return $submission;
    }
}
