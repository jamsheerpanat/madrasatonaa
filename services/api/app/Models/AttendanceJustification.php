<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AttendanceJustification extends Model
{
    use HasFactory;

    protected $fillable = [
        'attendance_record_id',
        'guardian_id',
        'justification_text',
        'attachment_url',
        'status',
        'reviewed_by_user_id',
        'reviewed_at',
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
    ];

    public function record()
    {
        return $this->belongsTo(AttendanceRecord::class, 'attendance_record_id');
    }

    public function guardian()
    {
        return $this->belongsTo(Guardian::class);
    }
}
