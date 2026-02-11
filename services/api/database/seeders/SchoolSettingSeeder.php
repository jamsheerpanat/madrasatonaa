<?php

namespace Database\Seeders;

use App\Models\SchoolSetting;
use Illuminate\Database\Seeder;

class SchoolSettingSeeder extends Seeder
{
    public function run(): void
    {
        SchoolSetting::create([
            'school_name' => 'Demo School',
            'country' => 'Kuwait',
            'timezone' => 'Asia/Kuwait',
            'academic_year_start_month' => 9,
            'week_start_day' => 'Sunday',
        ]);
    }
}
