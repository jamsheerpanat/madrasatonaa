<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Term extends Model
{
    use HasFactory;

    protected $fillable = [
        'academic_year_id',
        'name',
        'start_date',
        'end_date',
        'sort_order'
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'sort_order' => 'integer'
    ];

    public function publication()
    {
        return $this->hasOne(TermPublication::class);
    }

    // Helper: isPublished()
    public function isPublished()
    {
        return $this->publication && $this->publication->published_at && $this->publication->published_at->isPast();
    }
}
