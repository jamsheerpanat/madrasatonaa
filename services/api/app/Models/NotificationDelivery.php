<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NotificationDelivery extends Model
{
    use HasFactory;

    protected $fillable = [
        'notification_event_id',
        'recipient_user_id',
        'channel',
        'destination',
        'status',
        'attempt_count',
        'last_attempt_at',
        'sent_at',
        'error_message',
        'provider_message_id'
    ];

    public function event()
    {
        return $this->belongsTo(NotificationEvent::class, 'notification_event_id');
    }
}
