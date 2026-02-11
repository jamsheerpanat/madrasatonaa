<?php

namespace Database\Factories;

use App\Models\Exam;
use App\Models\Term;
use App\Models\Subject;
use Illuminate\Database\Eloquent\Factories\Factory;

class ExamFactory extends Factory
{
    protected $model = Exam::class;

    public function definition()
    {
        return [
            'exam_type' => fake()->randomElement(['MIDTERM', 'FINAL', 'QUIZ']),
            'exam_date' => fake()->dateTimeBetween('now', '+2 months'),
            'max_grade' => 100,
            // relationships needed
        ];
    }
}
