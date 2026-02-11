<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExamMark extends Model
{
    use HasFactory;

    protected $fillable = [
        'exam_id',
        'student_id',
        'grade_letter',
        'remarks',
        'skill_ratings_json',
        'updated_by_user_id'
        // updated_at is handled by standard timestamps
    ];

    protected $casts = [
        'skill_ratings_json' => 'array'
    ];
}
