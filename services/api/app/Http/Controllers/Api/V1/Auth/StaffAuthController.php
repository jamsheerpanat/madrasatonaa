<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StaffAuthController extends Controller
{
    protected $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|string',
            'password' => 'required|string',
            'device_id' => 'required|string',
            'device_name' => 'nullable|string',
            'platform' => 'nullable|in:WEB,IOS,ANDROID',
        ]);

        $result = $this->authService->staffLogin(
            $validated['email'],
            $validated['password'],
            [
                'device_id' => $validated['device_id'],
                'device_name' => $validated['device_name'] ?? null,
                'platform' => $validated['platform'] ?? 'WEB',
            ]
        );

        return response()->json($result);
    }
}
