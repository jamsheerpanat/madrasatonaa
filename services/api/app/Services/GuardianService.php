<?php

namespace App\Services;

use App\Models\Guardian;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class GuardianService
{
    /**
     * Link a guardian (parent user) to a student.
     */
    public function linkStudent(array $data)
    {
        $user = User::findOrFail($data['parent_user_id']);

        if (!$user->guardian) {
            // Should verify permissions or existence. 
            // For now, auto-create if missing (failsafe) or throw.
            throw ValidationException::withMessages(['parent_user_id' => 'User provides is not a guardian/parent.']);
        }

        $guardian = $user->guardian;

        // Sync or Attach (Attach allows duplicates if we aren't careful, DB PK prevents it)
        // We use syncWithoutDetaching to be safe or just attach assuming new
        $guardian->students()->syncWithoutDetaching([
            $data['student_id'] => [
                'relationship' => $data['relationship'],
                'is_primary' => $data['is_primary'] ?? false
            ]
        ]);

        return $guardian;
    }

    public function getChildren(int $userId)
    {
        $user = User::with('guardian.students.enrollments.section.grade.branch')->findOrFail($userId);

        if (!$user->guardian) {
            return [];
        }

        return $user->guardian->students;
    }
}
