<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TimelineEvent extends Model
{
    use HasFactory;

    protected $fillable = [
        'branch_id',
        'section_id',
        'student_id',
        'actor_user_id',
        'event_type',
        'title_en',
        'title_ar',
        'body_en',
        'body_ar',
        'payload_json',
        'visibility_scope',
        'audience_roles_json',
    ];

    protected $casts = [
        'payload_json' => 'array',
        'audience_roles_json' => 'array',
    ];

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function section()
    {
        return $this->belongsTo(Section::class);
    }

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function actor()
    {
        return $this->belongsTo(User::class, 'actor_user_id');
    }
}
