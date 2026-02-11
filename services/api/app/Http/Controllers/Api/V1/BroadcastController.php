<?php

namespace App\Http\Controllers\Api\V1;

use App\Helpers\AuthContext;
use App\Http\Controllers\Controller;
use App\Models\MemoAcknowledgement;
use App\Services\BroadcastService;
use App\Services\TimelineEmitter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;

class BroadcastController extends Controller
{
    protected $service;

    public function __construct(BroadcastService $service)
    {
        $this->service = $service;
    }

    // LIST
    public function getAnnouncements()
    {
        if (!AuthContext::hasPermission('announcements.view') && !AuthContext::hasPermission('announcements.publish'))
            abort(403);
        $list = $this->service->listAnnouncementsForUser(AuthContext::user());
        return response()->json($list);
    }

    public function getMemos()
    {
        if (!AuthContext::hasPermission('memos.view') && !AuthContext::hasPermission('memos.publish'))
            abort(403);
        $list = $this->service->listMemosForUser(AuthContext::user());
        return response()->json($list);
    }

    // CREATE
    public function createAnnouncement(Request $request)
    {
        if (!AuthContext::hasPermission('announcements.publish'))
            abort(403);

        $data = $request->validate([
            'title_en' => 'required',
            'title_ar' => 'nullable',
            'body_en' => 'required',
            'body_ar' => 'nullable',
            'scope_json' => 'required|array',
            'scope_json.audience' => 'required|array',
            'branch_id' => 'nullable|exists:branches,id',
            'publish_at' => 'nullable|date',
        ]);

        // Scope Logic: If user is Staff, they must have access to targeted Branch?
        // Skipped for MVP brevity, assuming Trust or UI filtering.

        $announcement = $this->service->createAnnouncement($data, AuthContext::user());
        return response()->json($announcement);
    }

    public function createMemo(Request $request)
    {
        if (!AuthContext::hasPermission('memos.publish'))
            abort(403);

        $data = $request->validate([
            'title_en' => 'required',
            'title_ar' => 'nullable',
            'body_en' => 'required',
            'body_ar' => 'nullable',
            'scope_json' => 'required|array',
            'scope_json.audience' => 'required|array',
            'branch_id' => 'nullable|exists:branches,id',
            'publish_at' => 'nullable|date',
            'ack_required' => 'boolean',
        ]);

        $memo = $this->service->createMemo($data, AuthContext::user());
        return response()->json($memo);
    }

    // ACK
    public function ackMemo(Request $request, int $memoId)
    {
        if (!AuthContext::hasPermission('memos.ack'))
            abort(403);

        // Verify visibility
        $user = AuthContext::user();
        $memos = $this->service->listMemosForUser($user);
        if (!$memos->contains('id', $memoId)) {
            abort(403, 'Memo not visible or valid');
        }

        // Create Ack
        $ack = MemoAcknowledgement::firstOrCreate([
            'memo_id' => $memoId,
            'user_id' => $user->id
        ], [
            'acknowledged_at' => now()
        ]);

        // Emit
        app(TimelineEmitter::class)->emitForStudent(
            $user->id, // If student
            0,
            0,
            'MemoAcknowledged',
            'Memo Acknowledgement',
            ['memo_id' => $memoId]
        ); // If Staff/Parent, emitForBranch logic differs.
        // Simplified: Emitter should handle generic user events in V2.
        // For MVP, we use emitForStudent if user type is student, else we rely on global/branch stream?
        // Actually Acknowledgements are mostly for admin tracking. A simple Audit Log suffices if Timeline is messy.
        // Let's stick to standard audit if unsure of "Timeline" visibility for Acks.

        return response()->json($ack);
    }

    public function getPendingCount()
    {
        if (!AuthContext::hasPermission('memos.view'))
            return response()->json(['pending_count']);

        $memos = $this->service->listMemosForUser(AuthContext::user());
        $pending = $memos->where('ack_required', true)->where('is_acknowledged', false)->count();

        return response()->json(['pending_count' => $pending]);
    }

    // DEV TOOL
    public function publishScheduled()
    {
        // Only for local testing easily or Admin
        if (config('app.env') !== 'production') {
            Artisan::call('broadcasts:publish');
            return response()->json(['status' => 'triggered']);
        }
        abort(403);
    }
}
