<?php

namespace Database\Factories;

use App\Models\StaffProfile;
use App\Models\User;
use App\Models\Branch;
use Illuminate\Database\Eloquent\Factories\Factory;

class StaffProfileFactory extends Factory
{
    protected $model = StaffProfile::class;

    public function definition()
    {
        return [
            'user_id' => User::factory()->state(['user_type' => 'STAFF']),
            'branch_id' => Branch::first() ? Branch::first()->id : null, // Default
            'employee_code' => 'EMP-' . fake()->unique()->numberBetween(100, 9999),
            'job_title' => fake()->jobTitle(),
        ];
    }
}
