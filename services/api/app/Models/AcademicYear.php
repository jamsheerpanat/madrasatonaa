<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AcademicYear extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'start_date',
        'end_date',
        'is_current',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'is_current' => 'boolean',
    ];

    // Ensure only one year is current
    protected static function booted()
    {
        static::saving(function ($year) {
            if ($year->is_current) {
                AcademicYear::where('id', '!=', $year->id)->update(['is_current' => false]);
            }
        });
    }
}
