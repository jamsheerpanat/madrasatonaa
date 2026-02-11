<?php

namespace App\Services;

use App\Models\Enrollment;
use App\Models\Student;
use Carbon\Carbon;

class StudentService
{
    /**
     * Create a student and enroll them.
     */
    public function createStudent(array $data)
    {
        return \DB::transaction(function () use ($data) {
            // 1. Create User
            $nameParts = explode(' ', $data['full_name'], 2);
            $firstName = $nameParts[0];
            $lastName = $nameParts[1] ?? '.';

            $user = \App\Models\User::create([
                'full_name' => $data['full_name'],
                'email' => $data['email'] ?? null,
                'phone' => $data['phone'] ?? null,
                'password' => \Hash::make('password'), // Global default or generate one
                'user_type' => 'STUDENT',
            ]);

            // Assign Student Role (assuming Role model handles this)
            $role = \App\Models\Role::where('name', 'Student')->first();
            if ($role) {
                $section = \App\Models\Section::with('grade')->find($data['section_id']);
                $branchId = $section ? $section->grade->branch_id : null;
                $user->roles()->attach($role->id, ['branch_id' => $branchId]);
            }

            // 2. Create Student record
            $student = Student::create([
                'admission_number' => $data['student_code'],
                'user_id' => $user->id,
                'first_name_en' => $firstName,
                'last_name_en' => $lastName,
                'gender' => $data['gender'] === 'MALE' ? 'M' : 'F',
                'dob' => $data['dob'] ?? Carbon::now()->subYears(10), // Default for demo if missing
                'address' => $data['address'] ?? null,
                'blood_group' => $data['blood_group'] ?? null,
                'status' => 'ACTIVE',
                'enrollment_date' => Carbon::now(),
            ]);

            // 3. Create Enrollment
            if (isset($data['section_id']) && isset($data['academic_year_id'])) {
                Enrollment::create([
                    'student_id' => $student->id,
                    'section_id' => $data['section_id'],
                    'academic_year_id' => $data['academic_year_id'],
                    'status' => 'ACTIVE',
                    'joined_at' => Carbon::now(),
                ]);
            }

            return $student->load('user');
        });
    }
}
