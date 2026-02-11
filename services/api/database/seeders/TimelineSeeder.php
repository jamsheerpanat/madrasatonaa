<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\Section;
use App\Services\TimelineEmitter;
use Illuminate\Database\Seeder;

class TimelineSeeder extends Seeder
{
    public function run(): void
    {
        // Only emit if we have data
        $branch = Branch::first();
        if (!$branch)
            return;

        $emitter = app(TimelineEmitter::class);

        // 1. Branch Event
        $emitter->emitForBranch($branch->id, 'Announcement', 'Welcome to Madrasatonaa Phase 2.0');

        // 2. Section Event
        $section = Section::first();
        if ($section) {
            $emitter->emitForSection($section->id, $section->grade->branch_id, 'TimetableUpdated', 'Term 1 Timetable is live');
        }

        // 3. Student Event? 
        // Need to create a student/parent link to meaningful seed, 
        // but for now let's skip or assume student exists from other tests later.
    }
}
