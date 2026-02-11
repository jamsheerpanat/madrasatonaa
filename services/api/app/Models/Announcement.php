<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Announcement extends Model
{
    use HasFactory;

    protected $fillable = [
        'branch_id',
        'title_en',
        'title_ar',
        'body_en',
        'body_ar',
        'scope_json',
        'publish_at',
        'published_at',
        'created_by_user_id',
    ];

    protected $casts = [
        'scope_json' => 'array',
        'publish_at' => 'datetime',
        'published_at' => 'datetime',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }
}
