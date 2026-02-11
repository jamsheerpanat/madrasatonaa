<?php

namespace Tests\Feature;

use App\Models\Branch;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class RbacTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Seed basics
        $this->seed(\Database\Seeders\SchoolSettingSeeder::class);
        $this->seed(\Database\Seeders\BranchSeeder::class);
        $this->seed(\Database\Seeders\RoleSeeder::class);
        $this->seed(\Database\Seeders\PermissionSeeder::class);
    }

    public function test_staff_without_token_cannot_access_admin()
    {
        $response = $this->getJson('/api/v1/admin/users');
        $response->assertStatus(401);
    }

    public function test_staff_without_permission_cannot_access_users()
    {
        $user = User::create([
            'full_name' => 'Teacher No Admin',
            'email' => 'teacher@test.com',
            'user_type' => 'STAFF',
            'password' => Hash::make('password'),
        ]);

        // Give Teacher role (which lacks admin.users.manage)
        $teacherRole = Role::where('name', 'Teacher')->first();
        $user->roles()->attach($teacherRole->id, ['branch_id' => 1]);

        $response = $this->actingAs($user)->getJson('/api/v1/admin/users');

        $response->assertStatus(403);
    }

    public function test_office_admin_bypass()
    {
        $user = User::create([
            'full_name' => 'Super Admin',
            'email' => 'admin@test.com',
            'user_type' => 'STAFF',
            'password' => Hash::make('password'),
        ]);

        $adminRole = Role::where('name', 'OfficeAdmin')->first();
        $user->roles()->attach($adminRole->id); // Global, no branch_id

        $response = $this->actingAs($user)->getJson('/api/v1/admin/users');

        $response->assertStatus(200);
    }

    public function test_teacher_scope_enforcement()
    {
        // Teacher allowed in Branch 1
        $user = User::create([
            'full_name' => 'Scoped Teacher',
            'email' => 'scoped@test.com',
            'user_type' => 'STAFF',
            'password' => Hash::make('password'),
        ]);

        $teacherRole = Role::where('name', 'Teacher')->first();
        $user->roles()->attach($teacherRole->id, ['branch_id' => 1]);

        // Hack: Give them admin.users.manage so we pass permission check, 
        // but fail branch check if they try Branch 2
        $perm = Permission::where('key', 'admin.users.manage')->first();
        $teacherRole->permissions()->attach($perm->id);

        // Try creating user in Branch 2 (Not allowed)
        $response = $this->actingAs($user)->postJson('/api/v1/admin/users', [
            'full_name' => 'Test User',
            'email' => 'test@user.com',
            'user_type' => 'STAFF',
            'branch_id' => 2, // Violation
            'roles' => ['Teacher'],
        ]);

        // Should be 403 Forbidden by EnforceBranchScope
        $response->assertStatus(403);
        $response->assertJsonFragment(['message' => 'You do not have access to this branch.']);
    }
}
