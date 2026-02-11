<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Submission extends Model
{
    use HasFactory;

    protected $fillable = [
        'assignment_id',
        'student_id',
        'submitted_by_user_id',
        'submitted_by_guardian_id',
        'submission_text',
        'submitted_at',
        'status',
        'grade_value',
        'grade_letter',
        'feedback',
        'graded_by_user_id',
        'graded_at'
    ];

    protected $casts = [
        'submitted_at' => 'datetime',
        'graded_at' => 'datetime',
        'grade_value' => 'integer'
    ];

    public function assignment()
    {
        return $this->belongsTo(Assignment::class);
    }

    public function attachments()
    {
        return $this->hasMany(SubmissionAttachment::class);
    }
}
