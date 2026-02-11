<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subject extends Model
{
    use HasFactory;

    protected $fillable = [
        'branch_id',
        'name',
        'name_en',
        'name_ar',
        'code',
        'type',
        'credits',
        'passing_marks',
        'max_marks',
        'description',
        'is_elective',
    ];

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }
}
