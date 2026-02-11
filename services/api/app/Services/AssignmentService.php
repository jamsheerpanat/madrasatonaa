<?php

namespace App\Services;

use App\Models\Assignment;
use App\Models\User;
use Carbon\Carbon;

class AssignmentService
{
    protected $timeline;

    public function __construct(TimelineEmitter $timeline)
    {
        $this->timeline = $timeline;
    }

    public function createAssignment(array $data, User $creator)
    {
        // Data validations expected to be handled by Controller/Request

        $assignment = Assignment::create([
            'branch_id' => $creator->roles()->first()?->pivot->branch_id ?? 1, // Fallback logic or explicit in payload
            'section_id' => $data['section_id'],
            'subject_id' => $data['subject_id'],
            'created_by_user_id' => $creator->id,
            'assignment_type' => $data['assignment_type'],
            'title_en' => $data['title_en'],
            'title_ar' => $data['title_ar'] ?? null,
            'instructions_en' => $data['instructions_en'],
            'instructions_ar' => $data['instructions_ar'] ?? null,
            'due_at' => isset($data['due_at']) ? Carbon::parse($data['due_at']) : null,
            'max_grade' => $data['max_grade'] ?? null,
            'status' => 'PUBLISHED',
            'published_at' => now(),
        ]);

        if (!empty($data['attachments'])) {
            $assignment->attachments()->createMany($data['attachments']);
        }

        // Timeline Event
        $this->timeline->emitForSection(
            $assignment->section_id,
            $assignment->branch_id,
            'AssignmentPosted',
            $assignment->title_en,
            [
                'id' => $assignment->id,
                'due_at' => $assignment->due_at?->toIso8601String(),
                'subject_id' => $assignment->subject_id
            ]
        );

        return $assignment;
    }

    public function listAssignmentsForTeacher(User $user)
    {
        return Assignment::where('created_by_user_id', $user->id)
            ->with('section.grade')
            ->orderByDesc('created_at')
            ->get();
    }

    public function listAssignmentsForSection(int $sectionId)
    {
        return Assignment::where('section_id', $sectionId)
            ->where('status', 'PUBLISHED')
            ->with('attachments')
            ->orderByDesc('created_at')
            ->get();
    }

    public function details(int $id)
    {
        return Assignment::with('attachments', 'section.grade')->findOrFail($id);
    }
}
