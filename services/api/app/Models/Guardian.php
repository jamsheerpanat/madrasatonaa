<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Guardian extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'national_id',
        'relation_notes',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function students()
    {
        return $this->belongsToMany(
            Student::class,
            'student_guardians',
            'guardian_user_id',
            'student_id',
            'user_id',
            'id'
        )
            ->withPivot(['relationship', 'is_primary']);
    }
}
