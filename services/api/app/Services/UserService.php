<?php

namespace App\Services;

use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;


class UserService
{
    protected $codeGenerator;

    public function __construct(CodeGeneratorService $codeGenerator)
    {
        $this->codeGenerator = $codeGenerator;
    }

    /**
     * Create a new user (Staff or Parent).
     */
    public function createUser(array $data)
    {
        // 1. Validate Uniqueness manually or rely on DB constraint (DB will throw)
        // Ideally controller handles basic validation, but we double check here if needed.

        // 2. Hash password if present
        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }

        // 3. Create User
        $user = User::create([
            'full_name' => $data['full_name'],
            'email' => $data['email'] ?? null,
            'phone' => $data['phone'] ?? null,
            'password' => $data['password'] ?? null,
            'user_type' => $data['user_type'],
            'is_active' => true,
        ]);

        // 4. Assign Roles
        if (isset($data['roles']) && is_array($data['roles'])) {
            $roles = Role::whereIn('name', $data['roles'])->get();
            $branchId = $data['branch_id'] ?? null;

            foreach ($roles as $role) {
                // Attach with branch_id
                $user->roles()->attach($role->id, ['branch_id' => $branchId]);
            }
        }

        // 5. Create Profile if Staff
        if ($data['user_type'] === 'STAFF') {
            $empCode = $data['employee_code'] ?? null;

            if (!$empCode) {
                // Auto-generate employee code
                $empCode = $this->codeGenerator->generate(\App\Models\StaffProfile::class, 'EMP', 'employee_code');
            }

            $user->staffProfile()->create([
                'branch_id' => $data['branch_id'] ?? null,
                'employee_code' => $empCode,
                'job_title' => $data['job_title'] ?? null,
            ]);
        }

        // 6. Create Guardian Profile if Parent
        if ($data['user_type'] === 'PARENT') {
            $user->guardian()->create([
                'national_id' => $data['national_id'] ?? null,
            ]);
        }

        return $user;
    }

    public function resetPassword(User $user, string $password)
    {
        $user->update([
            'password' => Hash::make($password)
        ]);

        return $user;
    }

    public function updateUser(User $user, array $data)
    {
        // 1. Update Basic Info
        $user->update([
            'full_name' => $data['full_name'] ?? $user->full_name,
            'email' => $data['email'] ?? $user->email,
            'phone' => $data['phone'] ?? $user->phone,
        ]);

        // 2. Update Password if provided
        if (!empty($data['password'])) {
            $user->update(['password' => Hash::make($data['password'])]);
        }

        // 3. Sync Roles
        if (isset($data['roles']) && is_array($data['roles'])) {
            // Detach existing roles (simplified for now, ideally scope by branch)
            $user->roles()->detach();

            $roles = Role::whereIn('name', $data['roles'])->get();
            $branchId = $data['branch_id'] ?? 1; // Default to main branch for now

            foreach ($roles as $role) {
                $user->roles()->attach($role->id, ['branch_id' => $branchId]);
            }
        }

        // 4. Update Profile if Staff
        if ($user->user_type === 'STAFF') {
            $user->staffProfile()->updateOrCreate(
                ['user_id' => $user->id],
                [
                    'branch_id' => $data['branch_id'] ?? 1,
                    'employee_code' => $data['employee_code'] ?? null,
                    'job_title' => $data['job_title'] ?? null,
                ]
            );
        }

        return $user->refresh();
    }
}
