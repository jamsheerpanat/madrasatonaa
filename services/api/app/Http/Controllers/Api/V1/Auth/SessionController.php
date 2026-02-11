<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SessionController extends Controller
{
    protected $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    public function refresh(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'refresh_token' => 'required|string',
            'device_id' => 'required|string',
        ]);

        $result = $this->authService->refreshTokens($validated['refresh_token'], $validated['device_id']);

        return response()->json($result);
    }

    public function logout(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'device_id' => 'required|string',
        ]);

        $this->authService->logout($validated['device_id']);

        return response()->json(['message' => 'Logged out successfully']);
    }
}
