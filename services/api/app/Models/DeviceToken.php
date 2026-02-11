<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DeviceToken extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'platform',
        'token',
        'is_active',
        'last_seen_at'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'last_seen_at' => 'datetime'
    ];
}
