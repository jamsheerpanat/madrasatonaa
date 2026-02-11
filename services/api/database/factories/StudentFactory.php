<?php

namespace Database\Factories;

use App\Models\Student;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class StudentFactory extends Factory
{
    protected $model = Student::class;

    public function definition()
    {
        return [
            'admission_number' => 'ADM-' . fake()->unique()->numberBetween(1000, 99999),
            'first_name_en' => fake()->firstName(),
            'first_name_ar' => null, // Optional
            'last_name_en' => fake()->lastName(),
            'last_name_ar' => null, // Optional
            'dob' => fake()->dateTimeBetween('-15 years', '-5 years'),
            'gender' => fake()->randomElement(['M', 'F']),
            'status' => 'ACTIVE',
            'enrollment_date' => fake()->dateTimeBetween('-5 years', 'now'),
            'user_id' => User::factory()->state(['user_type' => 'STUDENT']),
        ];
    }
}
