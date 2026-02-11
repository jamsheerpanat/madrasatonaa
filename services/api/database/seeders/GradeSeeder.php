<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\Grade;
use Illuminate\Database\Seeder;

class GradeSeeder extends Seeder
{
    public function run(): void
    {
        $branch = Branch::first();

        if (!$branch) {
            return;
        }

        $grades = [
            ['name' => 'KG1', 'level_type' => 'KG', 'sort_order' => 1],
            ['name' => 'KG2', 'level_type' => 'KG', 'sort_order' => 2],
            ['name' => 'Grade 1', 'level_type' => 'Primary', 'sort_order' => 3],
            ['name' => 'Grade 2', 'level_type' => 'Primary', 'sort_order' => 4],
        ];

        foreach ($grades as $grade) {
            Grade::create([
                'branch_id' => $branch->id,
                'name' => $grade['name'],
                'level_type' => $grade['level_type'],
                'sort_order' => $grade['sort_order'],
            ]);
        }
    }
}
