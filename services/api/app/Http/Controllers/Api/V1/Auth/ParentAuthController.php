<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Services\ParentOtpService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ParentAuthController extends Controller
{
    protected $otpService;

    public function __construct(ParentOtpService $otpService)
    {
        $this->otpService = $otpService;
    }

    public function requestOtp(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'phone' => 'required|string',
        ]);

        $result = $this->otpService->requestOtp($validated['phone']);

        return response()->json($result);
    }

    public function verifyOtp(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'phone' => 'required|string',
            'otp' => 'required|string',
            'device_id' => 'required|string',
            'device_name' => 'nullable|string',
            'platform' => 'nullable|in:WEB,IOS,ANDROID',
        ]);

        $result = $this->otpService->verifyOtp(
            $validated['phone'],
            $validated['otp'],
            [
                'device_id' => $validated['device_id'],
                'device_name' => $validated['device_name'] ?? null,
                'platform' => $validated['platform'] ?? 'WEB',
            ]
        );

        return response()->json($result);
    }
}
