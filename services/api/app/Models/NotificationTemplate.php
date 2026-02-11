<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NotificationTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'title_en',
        'title_ar',
        'body_en',
        'body_ar',
        'channels_json'
    ];

    protected $casts = ['channels_json' => 'array'];
}
