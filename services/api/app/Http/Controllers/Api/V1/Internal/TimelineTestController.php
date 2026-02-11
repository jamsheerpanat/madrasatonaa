<?php

namespace App\Http\Controllers\Api\V1\Internal;

use App\Helpers\AuthContext;
use App\Http\Controllers\Controller;
use App\Services\TimelineEmitter;
use Illuminate\Http\Request;

class TimelineTestController extends Controller
{
    protected $emitter;

    public function __construct(TimelineEmitter $emitter)
    {
        $this->emitter = $emitter;
    }

    public function emit(Request $request)
    {
        // Security check
        if (config('app.env') !== 'local' && config('app.env') !== 'testing') {
            abort(404);
        }

        if (!AuthContext::isOfficeAdmin()) {
            abort(403, 'Only OfficeAdmins can use test emitter');
        }

        $validated = $request->validate([
            'branch_id' => 'nullable|integer',
            'section_id' => 'nullable|integer',
            'student_id' => 'nullable|integer',
            'event_type' => 'required|string',
            'title_en' => 'required|string',
            'visibility_scope' => 'required|string',
            'payload' => 'nullable|array',
        ]);

        $validated['actor_user_id'] = $request->user()->id;

        $event = $this->emitter->emitEvent($validated);

        return response()->json($event, 201);
    }
}
