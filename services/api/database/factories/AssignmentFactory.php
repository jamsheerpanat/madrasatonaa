<?php

namespace Database\Factories;

use App\Models\Assignment;
use App\Models\Subject;
use App\Models\User;
use App\Models\Branch;
use App\Models\Section;
use Illuminate\Database\Eloquent\Factories\Factory;

class AssignmentFactory extends Factory
{
    protected $model = Assignment::class;

    public function definition()
    {
        return [
            'assignment_type' => fake()->randomElement(['HOMEWORK', 'PROJECT', 'CLASSWORK']),
            'title_en' => fake()->sentence(3),
            'instructions_en' => fake()->paragraph(),
            'due_at' => fake()->dateTimeBetween('now', '+2 weeks'),
            'max_grade' => fake()->randomElement([10, 20, 50, 100]),
            'status' => 'PUBLISHED',
            'published_at' => now(),
            // relationships should ideally be passed via state or create
        ];
    }
}
