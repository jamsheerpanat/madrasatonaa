<?php

namespace Tests\Feature;

use App\Models\AttendanceDay;
use App\Models\Enrollment;
use App\Models\Role;
use App\Models\Section;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class AttendanceTest extends TestCase
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
        $this->seed(\Database\Seeders\AcademicYearSeeder::class);
        $this->seed(\Database\Seeders\GradeSeeder::class);
        $this->seed(\Database\Seeders\SectionSeeder::class);
        $this->seed(\Database\Seeders\SubjectSeeder::class);
    }

    public function test_teacher_can_create_and_mark_attendance()
    {
        // Setup Teacher
        $teacher = User::factory()->create(['user_type' => 'STAFF']);
        $role = Role::where('name', 'Teacher')->first();
        $teacher->roles()->attach($role->id, ['branch_id' => 1]);

        // Setup Student in Section
        $section = Section::first();
        // Debug
        // fwrite(STDERR, "Section ID: " . $section->id . " Branch ID: " . $section->grade->branch_id . "\n");

        $student = Student::create(['full_name' => 'S1', 'student_code' => 'S1']);
        Enrollment::create([
            'student_id' => $student->id,
            'section_id' => $section->id,
            'academic_year_id' => \App\Models\AcademicYear::first()->id,
            'status' => 'ACTIVE'
        ]);

        $date = '2026-02-10';

        // 1. Create Day
        $response = $this->actingAs($teacher)->postJson("/api/v1/attendance/section/{$section->id}/day", [
            'date' => $date
        ]);

        if ($response->status() !== 200) {
            fwrite(STDERR, "Status: " . $response->status() . "\n");
            fwrite(STDERR, "Content: " . $response->getContent() . "\n");
            if ($response->exception) {
                fwrite(STDERR, "Exception: " . $response->exception->getMessage() . "\n");
            }
        }

        $response->assertStatus(200);
        $dayId = $response->json('data.id');

        $this->assertDatabaseHas('attendance_days', ['id' => $dayId, 'status' => 'DRAFT']);
        $this->assertDatabaseHas('attendance_records', ['attendance_day_id' => $dayId, 'student_id' => $student->id, 'status' => 'PRESENT']);

        // 2. Mark Absent
        $response = $this->actingAs($teacher)->putJson("/api/v1/attendance/day/{$dayId}/mark", [
            'marks' => [
                ['student_id' => $student->id, 'status' => 'ABSENT', 'note' => 'Sick']
            ]
        ]);
        $response->assertStatus(200);
        $this->assertDatabaseHas('attendance_records', ['student_id' => $student->id, 'status' => 'ABSENT']);
    }

    public function test_teacher_can_submit_attendance_locking_updates()
    {
        $teacher = User::factory()->create(['user_type' => 'STAFF']);
        $role = Role::where('name', 'Teacher')->first();
        $teacher->roles()->attach($role->id, ['branch_id' => 1]);

        $section = Section::first();
        $student = Student::create(['full_name' => 'S1', 'student_code' => 'S1']);
        Enrollment::create([
            'student_id' => $student->id,
            'section_id' => $section->id,
            'academic_year_id' => \App\Models\AcademicYear::first()->id,
            'status' => 'ACTIVE'
        ]);

        $date = '2026-02-11';
        $dayResponse = $this->actingAs($teacher)->postJson("/api/v1/attendance/section/{$section->id}/day", ['date' => $date]);
        $dayId = $dayResponse->json('data.id');

        // Submit
        $response = $this->actingAs($teacher)->postJson("/api/v1/attendance/day/{$dayId}/submit");
        $response->assertStatus(200);
        $this->assertDatabaseHas('attendance_days', ['id' => $dayId, 'status' => 'SUBMITTED']);

        // Check Timeline
        $this->assertDatabaseHas('timeline_events', ['event_type' => 'AttendanceSubmitted']);

        // Attempt Edit -> Should Fail
        $response = $this->actingAs($teacher)->putJson("/api/v1/attendance/day/{$dayId}/mark", [
            'marks' => [['student_id' => $student->id, 'status' => 'LATE']]
        ]);
        // ValidationException returns 422
        $response->assertStatus(422);
    }

    public function test_parent_can_submit_justification()
    {
        // Setup Parent & Child
        $parent = User::factory()->create(['user_type' => 'PARENT']);
        $role = Role::where('name', 'Parent')->first();
        $parent->roles()->attach($role->id);

        $parent->guardian()->create();
        $student = Student::create(['full_name' => 'Child', 'student_code' => 'C1']);
        $parent->guardian->students()->attach($student->id, ['relationship' => 'FATHER']);

        // Create Attendance Record (ABSENT)
        $section = Section::first();
        // create manual day to avoid perms
        $day = AttendanceDay::create([
            'branch_id' => 1,
            'section_id' => $section->id,
            'attendance_date' => '2026-02-12',
            'status' => 'SUBMITTED'
        ]);
        $record = \App\Models\AttendanceRecord::create([
            'attendance_day_id' => $day->id,
            'student_id' => $student->id,
            'status' => 'ABSENT'
        ]);

        // Submit Justification
        $response = $this->actingAs($parent)->postJson("/api/v1/attendance/parent/justify", [
            'attendance_record_id' => $record->id,
            'justification_text' => 'Was sick'
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('attendance_justifications', ['attendance_record_id' => $record->id, 'status' => 'SUBMITTED']);

        // Check Timeline Event
        $this->assertDatabaseHas('timeline_events', ['event_type' => 'AttendanceJustified']);
    }

    public function test_parent_cannot_justify_other_child()
    {
        $parent = User::factory()->create(['user_type' => 'PARENT']);
        $role = Role::where('name', 'Parent')->first();
        $parent->roles()->attach($role->id);
        $parent->guardian()->create(); // No children linked

        $otherStudent = Student::create(['full_name' => 'Other', 'student_code' => 'O1']);
        $section = Section::first();
        $day = AttendanceDay::create(['branch_id' => 1, 'section_id' => $section->id, 'attendance_date' => '2026-02-12']);
        $record = \App\Models\AttendanceRecord::create(['attendance_day_id' => $day->id, 'student_id' => $otherStudent->id]);

        $response = $this->actingAs($parent)->postJson("/api/v1/attendance/parent/justify", [
            'attendance_record_id' => $record->id,
            'justification_text' => 'Intruder'
        ]);

        $response->assertStatus(403);
    }
}
