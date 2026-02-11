<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AttendanceRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'attendance_day_id',
        'student_id',
        'status',
        'note',
    ];

    public function attendanceDay()
    {
        return $this->belongsTo(AttendanceDay::class);
    }

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function justification()
    {
        return $this->hasOne(AttendanceJustification::class);
    }
}
