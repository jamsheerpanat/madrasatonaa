<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Exam extends Model
{
    use HasFactory;

    protected $fillable = [
        'branch_id',
        'section_id',
        'subject_id',
        'term_id',
        'exam_type',
        'exam_date',
        'max_grade',
        'created_by_user_id'
    ];

    protected $casts = [
        'exam_date' => 'date',
        'max_grade' => 'integer'
    ];

    public function marks()
    {
        return $this->hasMany(ExamMark::class);
    }

    public function term()
    {
        return $this->belongsTo(Term::class);
    }
    public function section()
    {
        return $this->belongsTo(Section::class);
    }
}
