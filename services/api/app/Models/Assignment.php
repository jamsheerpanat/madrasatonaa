<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Assignment extends Model
{
    use HasFactory;

    protected $fillable = [
        'branch_id',
        'section_id',
        'subject_id',
        'created_by_user_id',
        'assignment_type',
        'title_en',
        'title_ar',
        'instructions_en',
        'instructions_ar',
        'due_at',
        'max_grade',
        'status',
        'published_at'
    ];

    protected $casts = [
        'due_at' => 'datetime',
        'published_at' => 'datetime',
        'max_grade' => 'integer'
    ];

    public function attachments()
    {
        return $this->hasMany(AssignmentAttachment::class);
    }

    public function submissions()
    {
        return $this->hasMany(Submission::class);
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }
    public function section()
    {
        return $this->belongsTo(Section::class);
    }
    // public function subject() { return $this->belongsTo(Subject::class); } // Assuming minimal Mock if default missing
}
