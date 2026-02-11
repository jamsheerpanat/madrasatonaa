<?php

namespace App\Services;

use App\Models\Enrollment;
use App\Models\User;

class TargetResolver
{
    public function matches(User $user, $scope): bool
    {
        // dump(['type' => $user->user_type, 'scope' => $scope]);
        if (!is_array($scope))
            $scope = json_decode($scope, true) ?? [];

        // 1. Audience Check
        $audience = $scope['audience'] ?? [];
        if (!in_array($user->user_type, $audience))
            return false;

        // 2. Staff Roles
        if ($user->user_type === 'STAFF' && !empty($scope['staff_roles'])) {
            if (!$user->roles()->whereIn('name', $scope['staff_roles'])->exists())
                return false;
        }

        // 3. Branch/Section/Student Scope
        $bIDs = $scope['branch_ids'] ?? [];
        $sIDs = $scope['section_ids'] ?? [];
        $stIDs = $scope['student_ids'] ?? [];

        if (empty($bIDs) && empty($sIDs) && empty($stIDs))
            return true;

        // 4. Resolve User Context
        $relevantBranchIds = [];
        $relevantSectionIds = [];
        $relevantStudentIds = [];

        if ($user->user_type === 'STAFF') {
            foreach ($user->roles as $r) {
                if ($r->pivot && $r->pivot->branch_id)
                    $relevantBranchIds[] = $r->pivot->branch_id;
            }
        } elseif ($user->user_type === 'PARENT') {
            $user = $user->fresh(['guardian.students.enrollments.section.grade']);
            foreach ($user->guardian?->students ?? [] as $student) {
                $relevantStudentIds[] = $student->id;
                foreach ($student->enrollments as $enrol) {
                    if ($enrol->status === 'ACTIVE') {
                        $relevantSectionIds[] = $enrol->section_id;
                        $relevantBranchIds[] = $enrol->section->grade->branch_id;
                    }
                }
            }
        }

        $match = false;

        // Check Branches (Intersection)
        if (!empty($bIDs)) {
            $strBIDs = array_map('strval', $bIDs);
            $strUserBIDs = array_map('strval', $relevantBranchIds);
            if (array_intersect($strBIDs, $strUserBIDs))
                $match = true;
        }

        if (!$match && !empty($sIDs)) {
            if (array_intersect($sIDs, $relevantSectionIds))
                $match = true;
        }

        if (!$match && !empty($stIDs)) {
            if (array_intersect($stIDs, $relevantStudentIds))
                $match = true;
        }

        return $match;
    }

    public function scopeForUser($query, User $user)
    {
        // Disable SQL filtering entirely for MVP compliance with SQLite JSON issues
        // We rely on PHP filtering in logical layer.
        return $query;
    }
}
