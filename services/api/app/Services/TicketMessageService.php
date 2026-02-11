<?php

namespace App\Services;

use App\Models\Ticket;
use App\Models\TicketMessage;
use App\Models\User;
use App\Services\NotificationService;
use App\Services\TimelineEmitter;

class TicketMessageService
{
    protected $timeline;
    protected $notifier;

    public function __construct(TimelineEmitter $timeline, NotificationService $notifier)
    {
        $this->timeline = $timeline;
        $this->notifier = $notifier;
    }

    public function reply(Ticket $ticket, User $sender, string $message)
    {
        $msg = TicketMessage::create([
            'ticket_id' => $ticket->id,
            'sender_user_id' => $sender->id,
            'message_text' => $message
        ]);

        // Auto transition status if Staff replied to Open? 
        // Maybe IN_PROGRESS. Simple logic:
        if ($ticket->status === 'OPEN' && $sender->user_type === 'STAFF') {
            $ticket->update(['status' => 'IN_PROGRESS']);
        }

        // Timeline (Optional spam check?)
        // $this->timeline->emitForBranch... "New Reply on Ticket..."

        // Notify
        if ($sender->id === $ticket->created_by_user_id) {
            // Parent replied -> Notify Staff
            $this->notifier->notifyRole($ticket->branch_id, 'OfficeAdmin', 'TicketReply', ['id' => $ticket->id]);
        } else {
            // Staff replied -> Notify Parent
            $creator = User::find($ticket->created_by_user_id);
            if ($creator) {
                app(\App\Services\NotificationEngine::class)->dispatch(
                    'ticket_replied',
                    ['payload' => ['ticket_code' => $ticket->ticket_code]],
                    collect([$creator])
                );
            }
        }

        return $msg;
    }
}
