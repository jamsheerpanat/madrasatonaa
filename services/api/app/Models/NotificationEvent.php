<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NotificationEvent extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_key',
        'branch_id',
        'section_id',
        'student_id',
        'actor_user_id',
        'payload_json'
    ];

    protected $casts = ['payload_json' => 'array'];

    public function deliveries()
    {
        return $this->hasMany(NotificationDelivery::class);
    }
}
