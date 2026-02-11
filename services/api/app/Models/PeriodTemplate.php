<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PeriodTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'branch_id',
        'name',
        'periods_per_day',
        'period_times_json',
        'is_active',
    ];

    protected $casts = [
        'period_times_json' => 'array',
        'is_active' => 'boolean',
    ];

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }
}
