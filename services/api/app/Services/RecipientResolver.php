<?php

namespace App\Services;

use App\Models\Student;
use App\Models\User;
use App\Models\Section;

class RecipientResolver
{
    public function resolveParentsOfStudent(int $studentId)
    {
        // Get Student -> Guardians -> Users
        $student = Student::find($studentId);
        if (!$student)
            return collect([]);

        return $student->guardians->map->user;
    }

    public function resolveParentsOfSection(int $sectionId)
    {
        // Section -> Enrollments -> Students -> Guardians -> Users
        $section = Section::with('enrollments.student.guardians.user')->find($sectionId);
        if (!$section)
            return collect([]);

        return $section->enrollments
            ->flatMap->student
            ->flatMap->guardians
            ->map->user
            ->unique('id');
    }
}
