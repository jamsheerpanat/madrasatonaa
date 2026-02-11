<?php

namespace Tests\Feature;

use App\Models\Branch;
use App\Models\Role;
use App\Models\User;
use App\Models\TimelineEvent;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class TimelineTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\SchoolSettingSeeder::class);
        $this->seed(\Database\Seeders\BranchSeeder::class); // Creates Main Branch (id 1)
        $this->seed(\Database\Seeders\RoleSeeder::class);

        // Seed some events
        $this->seed(\Database\Seeders\GradeSeeder::class);
        $this->seed(\Database\Seeders\SectionSeeder::class);
        $this->seed(\Database\Seeders\TimelineSeeder::class);
    }

    public function test_staff_sees_branch_event()
    {
        $user = User::create([
            'full_name' => 'Teacher 1',
            'email' => 't1@test.com',
            'user_type' => 'STAFF',
            'password' => Hash::make('password'),
        ]);

        $role = Role::where('name', 'Teacher')->first();
        $user->roles()->attach($role->id, ['branch_id' => 1]);

        $response = $this->actingAs($user)->getJson('/api/v1/timeline');

        $response->assertStatus(200);
        $response->assertJsonFragment(['title_en' => 'Welcome to Madrasatonaa Phase 2.0']);
    }

    public function test_staff_cannot_see_other_branch_event()
    {
        // Create Branch 2
        $branch2 = Branch::create(['name' => 'Branch 2', 'is_active' => true]);

        // Emit event for Branch 2
        \App\Models\TimelineEvent::create([
            'branch_id' => $branch2->id,
            'event_type' => 'Secret',
            'title_en' => 'Secret Event',
            'visibility_scope' => 'BRANCH',
        ]);

        $user = User::create([
            'full_name' => 'Teacher 1',
            'email' => 't1@test.com',
            'user_type' => 'STAFF',
            'password' => Hash::make('password'),
        ]);

        $role = Role::where('name', 'Teacher')->first();
        $user->roles()->attach($role->id, ['branch_id' => 1]); // Only Branch 1

        $response = $this->actingAs($user)->getJson('/api/v1/timeline');

        $response->assertStatus(200);
        $response->assertJsonMissing(['title_en' => 'Secret Event']);
    }

    public function test_parent_sees_linked_student_event()
    {
        // Create Parent
        $parent = User::create([
            'full_name' => 'Parent 1',
            'phone' => '123456',
            'user_type' => 'PARENT',
            'is_active' => true,
        ]);
        $parent->guardian()->create();

        // Create Child 1
        $child1 = \App\Models\Student::create([
            'student_code' => 'ST001',
            'full_name' => 'Child 1',
        ]);

        // Create Child 2 (Not Linked)
        $child2 = \App\Models\Student::create([
            'student_code' => 'ST002',
            'full_name' => 'Child 2',
        ]);

        // Link Parent to Child 1
        $parent->guardian->students()->attach($child1->id, ['relationship' => 'FATHER']);

        // Emit Event for Child 1
        \App\Models\TimelineEvent::create([
            'branch_id' => 1,
            'student_id' => $child1->id,
            'event_type' => 'Homework',
            'title_en' => 'Do math',
            'visibility_scope' => 'STUDENT',
        ]);

        // Emit Event for Child 2
        \App\Models\TimelineEvent::create([
            'branch_id' => 1,
            'student_id' => $child2->id,
            'event_type' => 'Homework',
            'title_en' => 'Do physics',
            'visibility_scope' => 'STUDENT',
        ]);

        $response = $this->actingAs($parent)->getJson('/api/v1/timeline');

        $response->assertStatus(200);
        $response->assertJsonFragment(['title_en' => 'Do math']);
        $response->assertJsonMissing(['title_en' => 'Do physics']);
    }

    public function test_parent_cannot_filter_other_child()
    {
        $parent = User::create([
            'full_name' => 'Parent 1',
            'phone' => '123456',
            'user_type' => 'PARENT',
        ]);
        $parent->guardian()->create();

        // Pass random child ID
        $response = $this->actingAs($parent)->getJson('/api/v1/timeline?child_student_id=999');

        // Logic currently returns empty feed or 403?
        // Service returns query with whereRaw(0=1) effectively empty.
        // Let's check status 200 but empty data
        $response->assertStatus(200);
        $response->assertJsonCount(0, 'data');
    }
}
