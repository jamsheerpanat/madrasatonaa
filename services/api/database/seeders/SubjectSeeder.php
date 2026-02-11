<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\Subject;
use Illuminate\Database\Seeder;

class SubjectSeeder extends Seeder
{
    public function run(): void
    {
        $branch = Branch::first();

        if (!$branch) {
            return;
        }

        $subjects = [
            'English',
            'Mathematics',
            'Science',
            'Arabic',
            'Islamic Studies',
        ];

        foreach ($subjects as $subjectName) {
            Subject::create([
                'branch_id' => $branch->id,
                'name' => $subjectName,
                'is_elective' => false,
            ]);
        }
    }
}
