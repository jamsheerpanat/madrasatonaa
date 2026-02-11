<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OtpChallenge extends Model
{
    use HasFactory;

    protected $fillable = [
        'phone',
        'otp_code_hash',
        'expires_at',
        'attempts_count',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
    ];
}
