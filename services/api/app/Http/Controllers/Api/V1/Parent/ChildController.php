<?php

namespace App\Http\Controllers\Api\V1\Parent;

use App\Http\Controllers\Controller;
use App\Services\GuardianService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChildController extends Controller
{
    protected $guardianService;

    public function __construct(GuardianService $guardianService)
    {
        $this->guardianService = $guardianService;
    }

    public function index(Request $request): JsonResponse
    {
        // Now using authenticated user ID
        $userId = $request->user()->id;

        $children = $this->guardianService->getChildren($userId);

        return response()->json($children);
    }
}
