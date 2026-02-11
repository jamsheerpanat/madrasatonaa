<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AttendanceDay extends Model
{
    use HasFactory;

    protected $fillable = [
        'branch_id',
        'section_id',
        'attendance_date',
        'status',
        'marked_by_user_id',
        'submitted_at',
        'reviewed_by_user_id',
        'reviewed_at',
    ];

    protected $casts = [
        'attendance_date' => 'date',
        'submitted_at' => 'datetime',
        'reviewed_at' => 'datetime',
    ];

    public function section()
    {
        return $this->belongsTo(Section::class);
    }

    public function records()
    {
        return $this->hasMany(AttendanceRecord::class);
    }

    public function marker()
    {
        return $this->belongsTo(User::class, 'marked_by_user_id');
    }
}
