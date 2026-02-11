<?php

namespace Database\Seeders;

use App\Models\Grade;
use App\Models\Section;
use Illuminate\Database\Seeder;

class SectionSeeder extends Seeder
{
    public function run(): void
    {
        $grades = Grade::all();

        foreach ($grades as $grade) {
            foreach (['A', 'B'] as $sectionName) {
                Section::create([
                    'grade_id' => $grade->id,
                    'name' => $sectionName,
                    'capacity' => 30,
                ]);
            }
        }
    }
}
