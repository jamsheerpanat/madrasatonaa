<?php

namespace App\Services;

use App\Models\TimelineEvent;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;

class TimelineFeedService
{
    public function getFeedForUser(User $user, array $filters = [])
    {
        $query = TimelineEvent::query();

        // 1. Role-Based Visibility Logic
        if ($user->user_type === 'STAFF') {
            $query = $this->applyStaffVisibility($query, $user);
        } elseif ($user->user_type === 'PARENT') {
            $query = $this->applyParentVisibility($query, $user, $filters['child_student_id'] ?? null);
        } elseif ($user->user_type === 'STUDENT') {
            // Future proofing
            // $query = $this->applyStudentVisibility($query, $user);
        }

        // 2. Common Filters
        if (!empty($filters['event_type'])) {
            $query->where('event_type', $filters['event_type']);
        }

        if (!empty($filters['date_from'])) {
            $query->where('created_at', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->where('created_at', '<=', $filters['date_to']);
        }

        // 3. Sorting & Pagination (Cursor)
        // Order by created_at desc, id desc (stable sort)
        return $query->orderBy('created_at', 'desc')
            ->orderBy('id', 'desc')
            ->cursorPaginate($filters['limit'] ?? 30);
    }

    protected function applyStaffVisibility(Builder $query, User $user)
    {
        // Resolve allowed branches (using AuthContext logic or direct calculation)
        // Since we are in service, we might rely on loaded relations or pass explicit scope.
        // For now let's assume `user->roles` has loaded scope.
        $user->loadMissing('roles');

        $allowedBranchIds = [];
        $userRoleNames = $user->roles->pluck('name')->toArray();

        foreach ($user->roles as $role) {
            if ($role->name === 'OfficeAdmin') {
                return $query; // See all? Or strict to visibility_scope logic but cross-branch?
                // OfficeAdmin sees everything generally, but let's stick to "relevant" items if possible?
                // Actually, OfficeAdmin should see all events generally.
            }
            if ($role->pivot->branch_id) {
                $allowedBranchIds[] = $role->pivot->branch_id;
            }
        }
        $allowedBranchIds = array_unique($allowedBranchIds);

        // Core logic:
        // (Scope=BRANCH AND branch_id IN scopes)
        // OR (Scope=SECTION AND branch_id IN scopes - section implied to be in branch)
        // OR (Scope=STAFF_ONLY AND branch_id IN scopes)
        // OR (Scope=CUSTOM AND audience_roles intersects with userRoleNames)

        // Complex WHERE clause
        return $query->where(function ($q) use ($allowedBranchIds, $userRoleNames) {

            // Standard Scopes within Allowed Branches
            $q->whereIn('branch_id', $allowedBranchIds)
                ->whereIn('visibility_scope', ['BRANCH', 'SECTION', 'STAFF_ONLY']);

            // Or Custom Targeting
            $q->orWhere(function ($sub) use ($userRoleNames) {
                $sub->where('visibility_scope', 'CUSTOM')
                    ->whereJsonContains('audience_roles_json', $userRoleNames); // Check if ANY role matches? whereJsonContains usually checks if value in array
                // Getting intersection in SQL JSON is hard. 
                // MVP: We assume audience_roles_json is array of strings. 
                // We check if any of user's roles is present.
                // This creates multiple OR clauses if user has many roles.
                // $sub->whereJsonOverlaps (MySQL 8.0+ or Postgres) - Laravel supports w/ whereJsonContains iterate?
            });

            // For now simplest CUSTOM implementation:
            foreach ($userRoleNames as $roleName) {
                $q->orWhere(function ($s) use ($roleName) {
                    $s->where('visibility_scope', 'CUSTOM')
                        ->whereJsonContains('audience_roles_json', $roleName);
                });
            }
        });
    }

    protected function applyParentVisibility(Builder $query, User $user, ?int $childStudentId = null)
    {
        // 1. Get All Linked Children
        $user->loadMissing('guardian.students.enrollments'); // deep load needed for sections

        if (!$user->guardian) {
            return $query->whereRaw('0 = 1'); // No children, no events
        }

        $allChildren = $user->guardian->students;
        $targetChildren = $allChildren;

        // If specific child requested, verify linkage and filter
        if ($childStudentId) {
            $found = $allChildren->where('id', $childStudentId)->first();
            if (!$found) {
                // Security: Parent cannot view non-linked child
                // We return empty set or throw. Empty set safer for filtering queries.
                return $query->whereRaw('0 = 1');
            }
            $targetChildren = collect([$found]);
        }

        // 2. Build Permission Lists
        $allowedStudentIds = $targetChildren->pluck('id')->toArray();
        $allowedSectionIds = [];
        $allowedBranchIds = [];

        foreach ($targetChildren as $child) {
            // Get ACTIVE enrollments for sections
            // We could also look at history? Usually timeline is relevant to current context or history of child.
            // Let's include all historical sections for now so they see past events too?
            // "Events for child's active enrollment" -> usually parents want to see history too.
            foreach ($child->enrollments as $enr) {
                $allowedSectionIds[] = $enr->section_id;
                // Branch from enrollment -> section -> grade -> branch?
                // Or simplified: We just check student_id events mostly.
            }
            // Branch IDs? Hard to trace efficiently without explicit join. 
            // For V1 MVP: Parents see:
            // - Events where student_id IN [their children] (Scope=STUDENT)
            // - Events where visibility_scope=SECTION AND section_id IN [children's sections]
            // - Events where visibility_scope=BRANCH ?? (Usually announcements). 
            //   This requires knowing the branch of the child.
            //   We can query `Enrollment::with('section.grade.branch')` to get branch IDs.
        }

        // Need to fetch branch IDs from sections to support BRANCH/PARENTS_ONLY scope
        // This makes this loop a bit heavier but inevitable.
        // Optimization: Cache child context on login?

        // For MVP, let's include section-based branch IDs.
        $sectionIds = array_unique($allowedSectionIds);
        // We assume we can get branches from context or we skip BRANCH scope for strict parents unless strictly targeted?
        // Let's try to support it.
        $branchIds = \App\Models\Section::whereIn('id', $sectionIds)
            ->with('grade')
            ->get()
            ->pluck('grade.branch_id')
            ->unique()
            ->toArray();


        return $query->where(function ($q) use ($allowedStudentIds, $sectionIds, $branchIds) {
            // A. Explicit Student Events
            $q->whereIn('student_id', $allowedStudentIds);

            // B. Section Events (SECTION or PARENTS_ONLY targeted at section)
            $q->orWhere(function ($sub) use ($sectionIds) {
                $sub->whereIn('section_id', $sectionIds)
                    ->whereIn('visibility_scope', ['SECTION', 'PARENTS_ONLY', 'CUSTOM']); // Logic on custom roles omitted for speed MVP
            });

            // C. Branch Events (BRANCH or PARENTS_ONLY targeted at branch)
            $q->orWhere(function ($sub) use ($branchIds) {
                $sub->whereIn('branch_id', $branchIds)
                    ->whereIn('visibility_scope', ['BRANCH', 'PARENTS_ONLY']);
            });

            // D. Custom Role Target (Parent)
            $q->orWhere(function ($sub) {
                $sub->where('visibility_scope', 'CUSTOM') // Global custom?
                    ->whereJsonContains('audience_roles_json', 'Parent');
            });
        });
    }
}
