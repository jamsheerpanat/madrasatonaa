<?php

namespace App\Services;

use App\Models\Ticket;
use App\Models\TicketMessage;
use App\Models\User;
use App\Services\NotificationService;
use App\Services\TimelineEmitter;
use App\Models\TicketStatusHistory;
use Illuminate\Support\Str;

class TicketService
{
    protected $timeline;
    protected $notifier;

    public function __construct(TimelineEmitter $timeline, NotificationService $notifier)
    {
        $this->timeline = $timeline;
        $this->notifier = $notifier;
    }

    public function createTicket(User $creator, array $data)
    {
        // Validations presumed done in Controller.

        // Generate Code
        $code = 'TKT-' . date('Y') . '-' . strtoupper(Str::random(6)); // Simple unique

        $ticket = Ticket::create([
            'ticket_code' => $code,
            'category_id' => $data['category_id'],
            'branch_id' => $data['branch_id'], // Derived from Student or Input
            'student_id' => $data['student_id'] ?? null,
            'created_by_user_id' => $creator->id,
            'status' => 'OPEN',
            'subject' => $data['subject'],
            'priority' => $data['priority'] ?? 'MEDIUM',
        ]);

        // Initial Message
        if (!empty($data['message'])) {
            $msg = \App\Models\TicketMessage::create([
                'ticket_id' => $ticket->id,
                'sender_user_id' => $creator->id,
                'message_text' => $data['message'],
            ]);

            // Attach Files
            if (!empty($data['attachment_file_ids'])) {
                foreach ($data['attachment_file_ids'] as $fid) {
                    \App\Models\FileLink::create([
                        'file_id' => $fid,
                        'entity_type' => \App\Models\TicketMessage::class,
                        'entity_id' => $msg->id,
                        'purpose' => 'TICKET_ATTACHMENT'
                    ]);
                }
            }
        }

        // Timeline
        $this->timeline->emitForBranch(
            $ticket->branch_id,
            'TicketCreated',
            "New Request: {$ticket->subject}",
            ['ticket_id' => $ticket->id, 'code' => $code]
        );

        // Notify Staff
        $this->notifier->notifyRole($ticket->branch_id, 'OfficeAdmin', 'TicketCreated', ['id' => $ticket->id]);

        return $ticket;
    }

    public function listForUser(User $user, array $filters = [])
    {
        $query = Ticket::with(['category', 'student', 'creator']);

        if ($user->user_type === 'PARENT') {
            $query->where('created_by_user_id', $user->id);
        } else {
            // Staff: Branch Scope
            $branchIds = $user->roles()->first()?->pivot->branch_id ? [$user->roles()->first()->pivot->branch_id] : [];
            // Or use AuthContext helper if updated context is passed
            // Simplest: use branch_id from first active role pivot
            if (!empty($branchIds))
                $query->whereIn('branch_id', $branchIds);
        }

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->orderByDesc('created_at')->paginate(20);
    }

    public function changeStatus(Ticket $ticket, string $newStatus, User $actor)
    {
        if ($ticket->status === $newStatus)
            return;

        $old = $ticket->status;
        $ticket->update([
            'status' => $newStatus,
            'resolved_at' => ($newStatus === 'RESOLVED' || $newStatus === 'CLOSED') ? now() : null
        ]);

        TicketStatusHistory::create([
            'ticket_id' => $ticket->id,
            'old_status' => $old,
            'new_status' => $newStatus,
            'changed_by_user_id' => $actor->id,
            'created_at' => now()
        ]);

        if ($newStatus === 'RESOLVED') {
            $this->timeline->emitForBranch($ticket->branch_id, 'TicketResolved', "Ticket Resolved: {$ticket->ticket_code}", ['ticket_id' => $ticket->id]);
            $this->notifier->notifyUser($ticket->created_by_user_id, 'TicketResolved', ['id' => $ticket->id]);
        }
    }
}
