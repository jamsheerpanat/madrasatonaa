<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TicketStatusHistory extends Model
{
    use HasFactory;

    public $timestamps = false; // Only created_at manually handled or via boot? 
    // Migration has created_at timestamp column. Eloquent usually expects both or none if $timestamps=false.
    // Let's set $timestamps = false and manually fill created_at or use event?
    // Actually easier to just enable timestamps but migration only has created_at? 
    // We defined `created_at` timestamp. 
    // Let's just use `UPDATED_AT = null`.

    const UPDATED_AT = null;

    protected $table = 'ticket_status_history';

    protected $fillable = [
        'ticket_id',
        'old_status',
        'new_status',
        'changed_by_user_id',
        'created_at'
    ];
}
