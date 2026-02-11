<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    use HasFactory;

    protected $fillable = [
        'admission_number',
        'first_name_en',
        'first_name_ar',
        'last_name_en',
        'last_name_ar',
        'dob', // date of birth
        'gender',
        'blood_group',
        'address',
        'status',
        'enrollment_date',
        'user_id',
    ];

    protected $casts = [
        'dob' => 'date',
        'enrollment_date' => 'date'
    ];

    protected $appends = ['full_name', 'student_code', 'email', 'phone'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function getFullNameAttribute()
    {
        return "{$this->first_name_en} {$this->last_name_en}";
    }

    public function getStudentCodeAttribute()
    {
        return $this->admission_number;
    }

    public function getEmailAttribute()
    {
        return $this->user ? $this->user->email : null;
    }

    public function getPhoneAttribute()
    {
        return $this->user ? $this->user->phone : null;
    }

    public function guardians()
    {
        return $this->belongsToMany(
            Guardian::class,
            'student_guardians',
            'student_id',
            'guardian_user_id',
            'id',
            'user_id'
        )
            ->withPivot(['relationship', 'is_primary'])
            ->withTimestamps();
    }

    public function enrollments()
    {
        return $this->hasMany(Enrollment::class);
    }

    // Helper to get active enrollment
    public function currentEnrollment()
    {
        return $this->hasOne(Enrollment::class)->where('status', 'ACTIVE');
    }
}
