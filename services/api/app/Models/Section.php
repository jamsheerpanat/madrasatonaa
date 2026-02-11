<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Section extends Model
{
    use HasFactory;

    protected $fillable = [
        'grade_id',
        'name',
        'capacity',
        'class_teacher_id',
    ];

    public function grade()
    {
        return $this->belongsTo(Grade::class);
    }

    public function classTeacher()
    {
        return $this->belongsTo(User::class, 'class_teacher_id');
    }

    public function enrollments()
    {
        return $this->hasMany(Enrollment::class);
    }

    public function sectionSubjects()
    {
        return $this->hasMany(SectionSubject::class);
    }

    public function subjects()
    {
        return $this->belongsToMany(Subject::class, 'section_subjects')
            ->withPivot('teacher_user_id')
            ->withTimestamps();
    }
}
