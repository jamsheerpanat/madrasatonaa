<?php

namespace App\Services;

use App\Models\OtpChallenge;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class ParentOtpService
{
    protected $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    public function requestOtp(string $phone)
    {
        // 1. Check if user exists as parent
        $user = User::where('phone', $phone)->where('user_type', 'PARENT')->first();
        if (!$user) {
            throw ValidationException::withMessages(['phone' => 'Parent account not found.']);
        }

        // 2. Generate OTP (Random 6 digits)
        $otp = (string) random_int(100000, 999999);

        // 3. Store Challenge
        OtpChallenge::create([
            'phone' => $phone,
            'otp_code_hash' => Hash::make($otp),
            'expires_at' => Carbon::now()->addMinutes(5),
            'attempts_count' => 0,
        ]);

        if (config('app.env') === 'local') {
            \Log::info("OTP generated for $phone: $otp");
        }

        // 4. Return
        if (config('app.env') === 'local') {
            return [
                'status' => 'otp_generated',
                'otp_dev_code' => $otp
            ];
        }

        return ['status' => 'otp_sent'];
    }

    public function verifyOtp(string $phone, string $otp, array $deviceInfo)
    {
        // 1. Find valid challenge
        $challenge = OtpChallenge::where('phone', $phone)
            ->where('expires_at', '>', Carbon::now())
            ->latest()
            ->first();

        if (!$challenge) {
            throw ValidationException::withMessages(['otp' => 'OTP expired or not requested.']);
        }

        if ($challenge->attempts_count >= 5) {
            throw ValidationException::withMessages(['otp' => 'Too many failed attempts.']);
        }

        if (!Hash::check($otp, $challenge->otp_code_hash)) {
            $challenge->increment('attempts_count');
            throw ValidationException::withMessages(['otp' => 'Invalid OTP code.']);
        }

        // 2. Clear challenge (consume it)
        $challenge->delete();

        // 3. Login
        $user = User::where('phone', $phone)->where('user_type', 'PARENT')->firstOrFail();

        return $this->authService->parentLogin($user, $deviceInfo);
    }
}
