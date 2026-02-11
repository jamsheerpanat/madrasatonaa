<?php

namespace App\Services;

use App\Models\File;
use App\Models\User;
use App\Helpers\AuthContext;

class FileAccessPolicy
{
    public function canAccess(User $user, File $file): bool
    {
        // 1. OfficeAdmin: All access? 
        // Or strictly scoped. Let's allow access if OfficeAdmin in current branch scope matches... 
        // But File doesn't have Branch ID directly. It relies on LINKS.
        // Files can be linked to multiple entities. Ideally access is granted if USER has access to AT LEAST ONE linked entity.

        $links = $file->links;

        foreach ($links as $link) {
            if ($this->canAccessEntity($user, $link->entity_type, $link->entity_id)) {
                return true;
            }
        }

        // If uploader is user?
        if ($file->uploaded_by_user_id === $user->id)
            return true;

        return false;
    }

    protected function canAccessEntity(User $user, string $type, int $id): bool
    {
        // Resolve entity
        // We can load it or use query.
        // For MVP, simplistic check based on type rules.

        if (str_contains($type, 'Ticket')) {
            // Ticket or TicketMessage
            // Messages belong to ticket.
            // If message, get ticket_id.
            $ticketId = $id;
            if (str_contains($type, 'TicketMessage')) {
                $msg = \App\Models\TicketMessage::find($id);
                if (!$msg)
                    return false;
                $ticketId = $msg->ticket_id;
            }

            $ticket = \App\Models\Ticket::find($ticketId);
            if (!$ticket)
                return false;

            // Access Logic same as TicketController
            if ($user->user_type === 'PARENT') {
                return $ticket->created_by_user_id === $user->id;
            } else {
                // Staff
                return in_array($ticket->branch_id, AuthContext::allowedBranchIds());
            }
        }

        if (str_contains($type, 'Assignment') || str_contains($type, 'Submission')) {
            // ... Logic ...
        }

        // Default strict
        return false;
    }
}
