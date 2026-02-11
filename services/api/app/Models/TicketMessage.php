<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TicketMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'ticket_id',
        'sender_user_id',
        'message_text',
        'attachment_url'
    ];

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_user_id');
    }
}
