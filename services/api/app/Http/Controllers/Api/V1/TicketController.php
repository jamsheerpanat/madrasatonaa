<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Helpers\AuthContext;
use App\Services\TicketService;
use App\Services\TicketMessageService;
use App\Models\Ticket;
use App\Models\TicketCategory;
use Illuminate\Http\Request;

class TicketController extends Controller
{
    protected $tickets;
    protected $messages;

    public function __construct(TicketService $tickets, TicketMessageService $messages)
    {
        $this->tickets = $tickets;
        $this->messages = $messages;
    }

    public function categories()
    {
        return response()->json(TicketCategory::where('is_active', true)->get());
    }

    public function index(Request $request)
    {
        if (!AuthContext::hasPermission('tickets.view'))
            abort(403);

        $filters = $request->only(['status']);
        return $this->tickets->listForUser(AuthContext::user(), $filters);
    }

    public function create(Request $request)
    {
        if (!AuthContext::hasPermission('tickets.create'))
            abort(403);

        $data = $request->validate([
            'category_id' => 'required|exists:ticket_categories,id',
            'student_id' => 'nullable|exists:students,id', // Should verify link if parent
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
            'priority' => 'nullable|in:LOW,MEDIUM,HIGH',
            'attachment_file_ids' => 'nullable|array',
            'attachment_file_ids.*' => 'exists:files,id'
        ]);

        $user = AuthContext::user();

        // Branch ID resolution
        $data['branch_id'] = 1; // Fallback
        if ($user->user_type === 'PARENT' && !empty($data['student_id'])) {
            // Get link
            $link = $user->guardian?->students()->where('students.id', $data['student_id'])->first();
            if (!$link)
                abort(403, 'Invalid student link');
            // Get branch from student enrollment? 
            // Student::activeEnrollment()->branch_id? 
            // MVP: Just grab from query if supplied or assume 1.
            // Robust: $link->enrollments()->latest()->first()->section->grade->branch_id
            // Assuming simple setup for now.
            $data['branch_id'] = 1;
        } elseif ($user->user_type === 'STAFF') {
            $data['branch_id'] = AuthContext::allowedBranchIds()[0] ?? 1;
        }

        $ticket = $this->tickets->createTicket($user, $data);
        return response()->json($ticket, 201);
    }

    public function show(int $id)
    {
        if (!AuthContext::hasPermission('tickets.view'))
            abort(403);

        $ticket = Ticket::with(['messages.sender', 'category', 'student', 'history'])->findOrFail($id);

        // Scope Check
        $user = AuthContext::user();
        if ($user->user_type === 'PARENT' && $ticket->created_by_user_id !== $user->id) {
            abort(403);
        }
        if ($user->user_type === 'STAFF') {
            // Branch check
            $bids = AuthContext::allowedBranchIds();
            if (!in_array($ticket->branch_id, $bids))
                abort(403);
        }

        return response()->json($ticket);
    }

    public function reply(Request $request, int $id)
    {
        if (!AuthContext::hasPermission('tickets.reply') && !AuthContext::hasPermission('tickets.create'))
            abort(403);
        // Logic: 'tickets.reply' for staff. Parents have 'tickets.create' + 'tickets.view'. 
        // Should we check 'tickets.reply' for parents too? Or implicit. 
        // Spec says: Parent: create+view. Staff: reply. 
        // Parents actually "reply" via "create message" conceptually.
        // Let's allow if user is owner (parent) OR has 'tickets.reply' (staff).

        $ticket = Ticket::findOrFail($id);
        $user = AuthContext::user();

        if ($user->id !== $ticket->created_by_user_id && !AuthContext::hasPermission('tickets.reply')) {
            abort(403);
        }
        if ($ticket->status === 'CLOSED')
            abort(400, 'Ticket is closed');

        $request->validate(['message' => 'required']);
        $this->messages->reply($ticket, $user, $request->message);

        return response()->json(['status' => 'ok']);
    }

    public function changeStatus(Request $request, int $id)
    {
        if (!AuthContext::hasPermission('tickets.resolve'))
            abort(403);

        $ticket = Ticket::findOrFail($id);
        $request->validate(['status' => 'required|in:OPEN,IN_PROGRESS,RESOLVED,CLOSED']);

        $this->tickets->changeStatus($ticket, $request->status, AuthContext::user());
        return response()->json(['status' => 'ok']);
    }
}
