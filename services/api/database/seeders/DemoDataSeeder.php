<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Role;
use App\Models\Student;
use App\Models\StaffProfile;
use App\Models\Branch;
use App\Models\Grade;
use App\Models\Section;
use App\Models\Subject;
use App\Models\Enrollment;
use App\Models\AcademicYear;
use App\Models\Term;
use App\Models\Assignment;
use App\Models\Exam;
use App\Models\AttendanceDay;
use App\Models\AttendanceRecord;
use App\Models\Ticket;
use App\Models\TicketCategory;
use App\Models\Announcement;
use App\Models\StudentGuardian;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DemoDataSeeder extends Seeder
{
    public function run()
    {
        $this->command->info('Starting massive demo data generation...');
        $password = Hash::make('password');
        $branch = Branch::first();
        $academicYear = AcademicYear::where('is_current', true)->first();

        if (!$branch || !$academicYear) {
            $this->command->error("Branch or Academic Year not found. Run StructureSeeder first.");
            return;
        }

        $roles = [
            'STUDENT' => Role::where('name', 'Student')->first(),
            'TEACHER' => Role::where('name', 'Teacher')->first(),
            'PARENT' => Role::where('name', 'Parent')->first(),
            'PRINCIPAL' => Role::where('name', 'Principal')->first(),
        ];

        // --- 1. CORE USERS (Fixed credentials for testing) ---
        $principal = User::firstOrCreate(
            ['email' => 'principal@madrasatonaa.com'],
            ['full_name' => 'Principal User', 'password' => $password, 'user_type' => 'STAFF', 'phone' => '11111111']
        );
        $principal->roles()->syncWithoutDetaching([$roles['PRINCIPAL']->id => ['branch_id' => $branch->id]]);
        StaffProfile::firstOrCreate(['user_id' => $principal->id], ['job_title' => 'Principal', 'employee_code' => 'EMP-ADMIN']);

        $teacherUser = User::firstOrCreate(
            ['email' => 'teacher@madrasatonaa.com'],
            ['full_name' => 'Teacher User', 'password' => $password, 'user_type' => 'STAFF', 'phone' => '22222222']
        );
        $teacherUser->roles()->syncWithoutDetaching([$roles['TEACHER']->id => ['branch_id' => $branch->id]]);
        StaffProfile::firstOrCreate(['user_id' => $teacherUser->id], ['job_title' => 'Head Teacher', 'employee_code' => 'EMP-TEACHER']);

        $parentUser = User::firstOrCreate(
            ['email' => 'parent@madrasatonaa.com'],
            ['full_name' => 'Parent User', 'password' => $password, 'user_type' => 'PARENT', 'phone' => '33333333']
        );
        $parentUser->roles()->syncWithoutDetaching([$roles['PARENT']->id]);

        $studentUser = User::firstOrCreate(
            ['email' => 'student@madrasatonaa.com'],
            ['full_name' => 'Student User', 'password' => $password, 'user_type' => 'STUDENT', 'phone' => '44444444']
        );
        $studentUser->roles()->syncWithoutDetaching([$roles['STUDENT']->id => ['branch_id' => $branch->id]]);

        $mainStudent = Student::firstOrCreate(
            ['admission_number' => 'ADM001'],
            [
                'user_id' => $studentUser->id,
                'first_name_en' => 'Student',
                'last_name_en' => 'User',
                'dob' => '2015-01-01',
                'gender' => 'M',
                'status' => 'ACTIVE',
                'enrollment_date' => now()->subYear(),
            ]
        );
        StudentGuardian::firstOrCreate(['student_id' => $mainStudent->id, 'guardian_user_id' => $parentUser->id], ['relationship' => 'FATHER', 'is_primary' => true]);

        // --- 2. BULK TEACHERS ---
        $this->command->info('Creating 10 Teachers...');
        $teachers = User::factory(10)->create(['user_type' => 'STAFF'])->each(function ($u) use ($roles, $branch) {
            $u->roles()->attach($roles['TEACHER']->id, ['branch_id' => $branch->id]);
            StaffProfile::factory()->create(['user_id' => $u->id, 'branch_id' => $branch->id]);
        });
        $teachers->push($teacherUser); // Add main teacher to collection

        // --- 3. BULK STUDENTS & ENROLLMENTS ---
        $this->command->info('Creating Students and Enrollments...');
        $grades = Grade::where('branch_id', $branch->id)->get();
        if ($grades->isEmpty()) {
            // Create default grades if missing (Grade 1 to 12)
            for ($i = 1; $i <= 12; $i++) {
                $grades->push(Grade::create(['branch_id' => $branch->id, 'name' => "Grade $i", 'level_type' => $i <= 6 ? 'PRIMARY' : 'SECONDARY']));
            }
        }

        $allStudents = collect([$mainStudent]);

        foreach ($grades as $grade) {
            // Create Sections A and B
            $sections = collect();
            foreach (['A', 'B'] as $sectName) {
                // Assign main teacher to first section of first grade
                $assignedTeacherId = null;
                if ($grade->name === 'Grade 1' && $sectName === 'A') {
                    $assignedTeacherId = $teacherUser->id;
                } else {
                    $assignedTeacherId = $teachers->random()->id;
                }

                $sections->push(Section::firstOrCreate(
                    ['grade_id' => $grade->id, 'name' => $sectName],
                    ['capacity' => 30, 'class_teacher_id' => $assignedTeacherId]
                ));
            }

            foreach ($sections as $section) {
                // Determine Class Teacher
                $start = now()->subMonths(5);

                // Create 15 students per section
                $sectionStudents = Student::factory(15)->make()->each(function ($s) use ($academicYear, $section, $branch, $roles) {
                    $u = User::factory()->create(['user_type' => 'STUDENT']);
                    $u->roles()->attach($roles['STUDENT']->id, ['branch_id' => $branch->id]);
                    $s->user_id = $u->id;
                    $s->save();

                    Enrollment::create([
                        'student_id' => $s->id,
                        'academic_year_id' => $academicYear->id,
                        'section_id' => $section->id,
                        'status' => 'ACTIVE',
                        'joined_at' => now()->subMonths(rand(1, 5))
                    ]);
                });

                $allStudents = $allStudents->merge($sectionStudents);

                // --- 4. ATTENDANCE (Last 30 days) ---
                $currentDate = now()->subDays(30);
                while ($currentDate <= now()) {
                    if ($currentDate->isWeekday()) {
                        $attDay = AttendanceDay::create([
                            'branch_id' => $branch->id,
                            'section_id' => $section->id,
                            'attendance_date' => $currentDate,
                            'status' => 'SUBMITTED',
                            'marked_by_user_id' => $teachers->random()->id
                        ]);

                        foreach ($sectionStudents as $s) {
                            // 90% Present, 5% Absent, 5% Late
                            $rand = rand(1, 100);
                            $status = 'PRESENT';
                            if ($rand > 95)
                                $status = 'ABSENT';
                            elseif ($rand > 90)
                                $status = 'LATE';

                            AttendanceRecord::create([
                                'attendance_day_id' => $attDay->id,
                                'student_id' => $s->id,
                                'status' => $status
                            ]);
                        }
                    }
                    $currentDate->addDay();
                }
            }
        }

        // --- 5. ACADEMIC DATA (Assignments & Exams) ---
        $subjects = Subject::where('branch_id', $branch->id)->get();
        if ($subjects->isEmpty()) {
            $subjects = collect();
            $subjects->push(Subject::create(['branch_id' => $branch->id, 'name' => 'Mathematics', 'code' => 'MATH']));
            $subjects->push(Subject::create(['branch_id' => $branch->id, 'name' => 'Science', 'code' => 'SCI']));
            $subjects->push(Subject::create(['branch_id' => $branch->id, 'name' => 'English', 'code' => 'ENG']));
            $subjects->push(Subject::create(['branch_id' => $branch->id, 'name' => 'History', 'code' => 'HIS']));
        }

        $this->command->info('Creating Assignments and Exams...');
        $sections = Section::all();
        $terms = Term::where('academic_year_id', $academicYear->id)->get();

        foreach ($sections as $section) {
            foreach ($subjects as $subject) {
                // Create 3 Assignments per subject per section
                Assignment::factory(3)->create([
                    'branch_id' => $branch->id,
                    'section_id' => $section->id,
                    'subject_id' => $subject->id,
                    'created_by_user_id' => $teachers->random()->id,
                ]);

                // Create Exams if terms exist
                foreach ($terms as $term) {
                    Exam::factory()->create([
                        'branch_id' => $branch->id,
                        'section_id' => $section->id,
                        'subject_id' => $subject->id,
                        'term_id' => $term->id,
                        'exam_type' => 'MIDTERM',
                        'created_by_user_id' => $teachers->random()->id
                    ]);
                }
            }
        }

        // --- 6. TICKETS & ANNOUNCEMENTS ---
        TicketCategory::firstOrCreate(['name_en' => 'General']);
        $cats = TicketCategory::all();

        // Create 20 random tickets
        for ($i = 0; $i < 20; $i++) {
            Ticket::create([
                'ticket_code' => 'TKT-' . fake()->unique()->numerify('####'),
                'branch_id' => $branch->id,
                'category_id' => $cats->random()->id,
                'created_by_user_id' => $parentUser->id, // Simplified: mostly from parent
                'subject' => fake()->sentence(),
                'status' => fake()->randomElement(['OPEN', 'CLOSED', 'IN_PROGRESS']),
                'priority' => fake()->randomElement(['LOW', 'MEDIUM', 'HIGH']),
            ]);
        }

        // Announcements
        Announcement::firstOrCreate(['title_en' => 'Welcome Back'], [
            'branch_id' => $branch->id,
            'created_by_user_id' => $principal->id,
            'body_en' => 'Welcome to the new academic year!',
            'scope_json' => ['roles' => [], 'type' => 'GENERAL'],
            'published_at' => now(),
            'publish_at' => now(),
        ]);

        $this->command->info("Massive Data Generation Complete!");
    }
}
