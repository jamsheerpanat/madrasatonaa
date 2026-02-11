<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExamTest extends TestCase
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
    }

    public function test_teacher_can_enter_marks()
    {
        $teacher = User::factory()->create(['user_type' => 'STAFF']);
        $role = Role::where('name', 'Teacher')->first();
        $teacher->roles()->attach($role->id, ['branch_id' => 1]);

        $term = \App\Models\Term::create([
            'academic_year_id' => 1,
            'name' => 'Term 1',
            'start_date' => now(),
            'end_date' => now()->addMonths(3)
        ]);

        $grade = \App\Models\Grade::create(['name' => 'G1', 'level_type' => 'Primary', 'section_naming_type' => 'NUMERIC', 'branch_id' => 1]);
        $section = \App\Models\Section::create(['name' => 'A', 'grade_id' => $grade->id, 'capacity' => 30]);

        $exam = \App\Models\Exam::create([
            'branch_id' => 1,
            'section_id' => $section->id,
            'subject_id' => 1,
            'term_id' => $term->id,
            'exam_type' => 'MIDTERM',
            'exam_date' => now()->addDays(2),
            'max_grade' => 100,
            'created_by_user_id' => $teacher->id
        ]);

        $student = \App\Models\Student::create(['full_name' => 'S1', 'student_code' => 'S1']);

        $payload = [
            'marks' => [
                ['student_id' => $student->id, 'grade_letter' => 'A', 'remarks' => 'Good']
            ]
        ];

        $res = $this->actingAs($teacher)->putJson("/api/v1/exams/{$exam->id}/marks", $payload);
        $res->assertStatus(200);

        $this->assertDatabaseHas('exam_marks', ['student_id' => $student->id, 'grade_letter' => 'A']);
        $this->assertDatabaseHas('timeline_events', ['event_type' => 'MarksUpdated']);
    }

    public function test_parent_cannot_view_unpublished_results()
    {
        $parent = User::factory()->create(['user_type' => 'PARENT']);
        $parent->roles()->attach(Role::where('name', 'Parent')->first()->id);

        $term = \App\Models\Term::create([
            'academic_year_id' => 1,
            'name' => 'Term 1',
            'start_date' => now(),
            'end_date' => now()->addMonths(3)
        ]);
        // Unpublished

        $grade = \App\Models\Grade::create(['name' => 'G1', 'level_type' => 'Primary', 'section_naming_type' => 'NUMERIC', 'branch_id' => 1]);
        $section = \App\Models\Section::create(['name' => 'A', 'grade_id' => $grade->id, 'capacity' => 30]);

        $res = $this->actingAs($parent)->getJson("/api/v1/exams/section/{$section->id}?term_id={$term->id}");
        // 403 Forbidden because term not published
        // Or "term_id required" if logic checks. Logic check "isPublished".
        // BUT wait, in Controller:
        /*
        if ($user->user_type === 'PARENT') {
            $term = Term::find($termId);
            if (!$term || !$term->isPublished()) abort(403, 'Not published yet');
        */
        $res->assertStatus(403);
    }
}
