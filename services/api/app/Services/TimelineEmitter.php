<?php

namespace App\Services;

use App\Models\TimelineEvent;
use Illuminate\Validation\ValidationException;

class TimelineEmitter
{
    /**
     * Emit a new timeline event.
     *
     * @param array $data
     * @return TimelineEvent
     */
    public function emitEvent(array $data): TimelineEvent
    {
        // 1. Validate based on scope
        $scope = $data['visibility_scope'] ?? 'CUSTOM';

        if ($scope === 'STUDENT' && empty($data['student_id'])) {
            throw ValidationException::withMessages(['student_id' => 'Student ID required for STUDENT scope']);
        }

        if ($scope === 'SECTION' && empty($data['section_id'])) {
            throw ValidationException::withMessages(['section_id' => 'Section ID required for SECTION scope']);
        }

        if ($scope === 'BRANCH' && empty($data['branch_id'])) {
            throw ValidationException::withMessages(['branch_id' => 'Branch ID required for BRANCH scope']);
        }

        if (empty($data['branch_id']) && empty($data['section_id']) && empty($data['student_id'])) {
            // At least one context usually required unless truly global system wide (rare in this model)
            // We allow it only if strictly intended (e.g. STAFF_ONLY global), but usually we want branch_id at least.
            if ($scope !== 'STAFF_ONLY' && $scope !== 'CUSTOM') {
                // Warning or enforcing branch_id for multi-tenant feel? 
                // Let's enforce branch_id for generic broadcasts to avoid accidentally global leaks
            }
        }

        // 2. Create Event
        return TimelineEvent::create([
            'branch_id' => $data['branch_id'] ?? null,
            'section_id' => $data['section_id'] ?? null,
            'student_id' => $data['student_id'] ?? null,
            'actor_user_id' => $data['actor_user_id'] ?? null,
            'event_type' => $data['event_type'],
            'title_en' => $data['title_en'],
            'title_ar' => $data['title_ar'] ?? null,
            'body_en' => $data['body_en'] ?? null,
            'body_ar' => $data['body_ar'] ?? null,
            'payload_json' => $data['payload'] ?? null,
            'visibility_scope' => $scope,
            'audience_roles_json' => $data['audience_roles'] ?? null,
        ]);
    }

    // Helpers
    public function emitForBranch(int $branchId, string $type, string $title, ?array $payload = [])
    {
        return $this->emitEvent([
            'branch_id' => $branchId,
            'event_type' => $type,
            'title_en' => $title,
            'visibility_scope' => 'BRANCH',
            'payload' => $payload,
        ]);
    }

    public function emitForSection(int $sectionId, int $branchId, string $type, string $title, ?array $payload = [])
    {
        return $this->emitEvent([
            'branch_id' => $branchId,
            'section_id' => $sectionId,
            'event_type' => $type,
            'title_en' => $title,
            'visibility_scope' => 'SECTION',
            'payload' => $payload,
        ]);
    }

    public function emitForStudent(int $studentId, int $sectionId, int $branchId, string $type, string $title, ?array $payload = [])
    {
        return $this->emitEvent([
            'branch_id' => $branchId,
            'section_id' => $sectionId,
            'student_id' => $studentId,
            'event_type' => $type,
            'title_en' => $title,
            'visibility_scope' => 'STUDENT',
            'payload' => $payload,
        ]);
    }
}
