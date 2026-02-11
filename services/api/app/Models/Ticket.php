<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ticket extends Model
{
    use HasFactory;

    protected $fillable = [
        'ticket_code',
        'category_id',
        'branch_id',
        'student_id',
        'created_by_user_id',
        'assigned_to_user_id',
        'status',
        'subject',
        'priority',
        'resolved_at'
    ];

    protected $casts = [
        'resolved_at' => 'datetime'
    ];

    public function category()
    {
        return $this->belongsTo(TicketCategory::class);
    }
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }
    public function student()
    {
        return $this->belongsTo(Student::class);
    }
    public function messages()
    {
        return $this->hasMany(TicketMessage::class)->orderBy('created_at');
    }
    public function history()
    {
        return $this->hasMany(TicketStatusHistory::class)->orderByDesc('created_at');
    }
    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }
}
