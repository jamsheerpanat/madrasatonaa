<?php

namespace Tests\Feature;

use App\Models\Branch;
use App\Models\Role;
use App\Models\User;
use App\Models\Student;
use App\Models\Section;
use App\Models\Subject;
use App\Helpers\AuthContext;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class TimetableTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\SchoolSettingSeeder::class);
        $this->seed(\Database\Seeders\BranchSeeder::class);
        $this->seed(\Database\Seeders\RoleSeeder::class);
        $this->seed(\Database\Seeders\PermissionSeeder::class);
        $this->seed(\Database\Seeders\AcademicYearSeeder::class);
        $this->seed(\Database\Seeders\GradeSeeder::class);
        $this->seed(\Database\Seeders\SectionSeeder::class);
        $this->seed(\Database\Seeders\SubjectSeeder::class);
    }

    public function test_principal_can_update_timetable()
    {
        $payload = [
            'entries' => [
                [
                    'day_of_week' => 'SUN',
                    'period_no' => 1,
                    'subject_id' => 1,
                    'teacher_user_id' => null
                ]
            ]
        ];

        $user = User::create([
            'full_name' => 'Principal',
            'email' => 'princ@test.com',
            'password' => Hash::make('password'),
            'user_type' => 'STAFF'
        ]);
        $role = Role::where('name', 'Principal')->first();
        $user->roles()->attach($role->id, ['branch_id' => 1]);

        $section = Section::first();

        $response = $this->actingAs($user)->putJson("/api/v1/timetable/section/{$section->id}", $payload);

        $response->assertStatus(200);
    }

    public function test_teacher_cannot_update_timetable()
    {
        $payload = [
            'entries' => [
                [
                    'day_of_week' => 'SUN',
                    'period_no' => 1,
                    'subject_id' => 1,
                ]
            ]
        ];

        $user = User::create([
            'full_name' => 'T1',
            'email' => 't1@test.com',
            'password' => Hash::make('password'),
            'user_type' => 'STAFF'
        ]);
        $role = Role::where('name', 'Teacher')->first();
        $user->roles()->attach($role->id, ['branch_id' => 1]);

        $section = Section::first();

        $response = $this->actingAs($user)->putJson("/api/v1/timetable/section/{$section->id}", $payload);

        $response->assertStatus(403);
    }

    public function test_parent_can_view_child_timetable()
    {
        $parent = User::create([
            'full_name' => 'P1',
            'user_type' => 'PARENT',
        ]);
        $role = Role::where('name', 'Parent')->first();
        $parent->roles()->attach($role->id); // Parent role global or branch? Parent role usually doesn't have branch pivot in this system or does it? 
        // RoleSeeder doesn't specify. AuthContext allows empty branch for system roles.
        // Parent role is usually global.

        $parent->guardian()->create();

        $child = Student::create(['full_name' => 'C1', 'student_code' => 'C1']);
        $section = Section::first();

        \App\Models\Enrollment::create([
            'student_id' => $child->id,
            'section_id' => $section->id,
            'academic_year_id' => \App\Models\AcademicYear::first()->id,
            'status' => 'ACTIVE'
        ]);

        $parent->guardian->students()->attach($child->id, ['relationship' => 'FATHER']);

        \App\Models\TimetableEntry::create([
            'branch_id' => 1,
            'section_id' => $section->id,
            'day_of_week' => 'MON',
            'period_no' => 1,
            'subject_id' => 1
        ]);

        $response = $this->actingAs($parent)->getJson("/api/v1/timetable/parent/child/{$child->id}");

        $response->assertStatus(200);
        $response->assertJsonFragment(['day_of_week' => 'MON']);
    }
}
