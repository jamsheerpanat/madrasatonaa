<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\TimelineFeedService;
use Illuminate\Http\Request;

class TimelineController extends Controller
{
    protected $feedService;

    public function __construct(TimelineFeedService $feedService)
    {
        $this->feedService = $feedService;
    }

    public function index(Request $request)
    {
        $user = $request->user();

        $filters = [
            'branch_id' => $request->query('branch_id'),
            'child_student_id' => $request->query('child_student_id'),
            'event_type' => $request->query('event_type'),
            'date_from' => $request->query('date_from'),
            'date_to' => $request->query('date_to'),
            'limit' => $request->query('limit', 30),
        ];

        $feed = $this->feedService->getFeedForUser($user, $filters);

        return response()->json($feed);
    }
}
