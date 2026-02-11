<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TermPublication extends Model
{
    use HasFactory;

    protected $fillable = [
        'term_id',
        'publish_at',
        'published_at',
        'created_by_user_id'
    ];

    protected $casts = [
        'publish_at' => 'datetime',
        'published_at' => 'datetime'
    ];
}
