<?php

namespace App\Services;

use App\Models\AuthSession;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthService
{
    protected $tokenService;

    public function __construct(TokenService $tokenService)
    {
        $this->tokenService = $tokenService;
    }

    public function staffLogin(string $email, string $password, array $deviceInfo)
    {
        $email = trim($email);
        \Log::info("Attempting staff login for email: '$email' (length: " . strlen($email) . ")");

        $user = User::where('email', $email)->whereIn('user_type', ['STAFF', 'STUDENT'])->first();

        if (!$user) {
            \Log::info("No user found with email '$email' and types STAFF/STUDENT. Checking student code...");
            // Try by student code
            $student = \App\Models\Student::where('admission_number', $email)->first();
            if ($student && $student->user) {
                \Log::info("Student found by admission number. User ID: " . $student->user->id);
                $user = $student->user;
            } else {
                \Log::info("No student found by admission number or no user liked.");
            }
        }

        if (!$user) {
            \Log::warning("Login failed: User not found for email: $email");
            throw ValidationException::withMessages(['email' => 'Invalid credentials.']);
        }

        if (!Hash::check($password, $user->password)) {
            \Log::warning("Login failed for email: $email. Password check failed. User Type: " . $user->user_type);
            throw ValidationException::withMessages(['email' => 'Invalid credentials.']);
        }

        \Log::info("Login successful for email: $email");
        return $this->createSession($user, $deviceInfo);
    }

    public function parentLogin(User $user, array $deviceInfo)
    {
        if ($user->user_type !== 'PARENT') {
            throw ValidationException::withMessages(['phone' => 'Not a parent account.']);
        }
        return $this->createSession($user, $deviceInfo);
    }

    public function parentLoginPassword(string $login, string $password, array $deviceInfo)
    {
        $login = trim($login);
        $user = User::where(function ($q) use ($login) {
            $q->where('email', $login)->orWhere('phone', $login);
        })->where('user_type', 'PARENT')->first();

        if (!$user || !Hash::check($password, $user->password)) {
            throw ValidationException::withMessages(['login' => 'Invalid credentials.']);
        }

        return $this->createSession($user, $deviceInfo);
    }

    protected function createSession(User $user, array $deviceInfo)
    {
        return DB::transaction(function () use ($user, $deviceInfo) {
            // 1. Generate Access Token
            $accessTokenData = $this->tokenService->generateAccessToken($user, $deviceInfo['device_id']);

            // 2. Generate Refresh Token
            $refreshToken = $this->tokenService->generateRefreshToken();
            $refreshTokenHash = $this->tokenService->hashRefreshToken($refreshToken);

            // 3. Create/Update Auth Session
            // We upset based on device_id for this user to avoid dups per device
            AuthSession::updateOrCreate(
                [
                    'user_id' => $user->id,
                    'device_id' => $deviceInfo['device_id']
                ],
                [
                    'device_name' => $deviceInfo['device_name'] ?? null,
                    'platform' => $deviceInfo['platform'] ?? 'WEB',
                    'refresh_token_hash' => $refreshTokenHash,
                    'refresh_token_expires_at' => Carbon::now()->addDays(30),
                    'last_used_at' => Carbon::now(),
                    'revoked_at' => null,
                ]
            );

            // 4. Update User Last Login
            $user->update(['last_login_at' => Carbon::now()]);

            // 5. Build Response
            return [
                'access_token' => $accessTokenData['token'],
                'access_expires_in' => $accessTokenData['expires_in'], // 15 mins typically
                'refresh_token' => $refreshToken,
                'refresh_expires_in_days' => 30,
                'user' => $user->load('roles.permissions'), // simplified load
            ];
        });
    }

    public function refreshTokens(string $refreshToken, string $deviceId)
    {
        $refreshTokenHash = $this->tokenService->hashRefreshToken($refreshToken);

        $session = AuthSession::where('device_id', $deviceId)
            ->where('refresh_token_hash', $refreshTokenHash)
            ->where('refresh_token_expires_at', '>', Carbon::now())
            ->whereNull('revoked_at')
            ->first();

        if (!$session) {
            throw ValidationException::withMessages(['refresh_token' => 'Invalid or expired session.']);
        }

        return DB::transaction(function () use ($session) {
            $user = $session->user;

            // Rotate Refresh Token
            $newRefreshToken = $this->tokenService->generateRefreshToken();

            $session->update([
                'refresh_token_hash' => $this->tokenService->hashRefreshToken($newRefreshToken),
                'refresh_token_expires_at' => Carbon::now()->addDays(30),
                'last_used_at' => Carbon::now(),
            ]);

            // Generate New Access Token
            $accessTokenData = $this->tokenService->generateAccessToken($user, $session->device_id);

            return [
                'access_token' => $accessTokenData['token'],
                'access_expires_in' => $accessTokenData['expires_in'],
                'refresh_token' => $newRefreshToken,
                'refresh_expires_in_days' => 30,
            ];
        });
    }

    public function logout(string $deviceId)
    {
        AuthSession::where('device_id', $deviceId)->update(['revoked_at' => Carbon::now()]);
        // Also revoke Sanctum tokens for this user/device? 
        // Sanctum tokens are stored in personal_access_tokens. 
        // If we named them by device_id, we can delete them.
        // For now, we rely on short expiration of access tokens.
    }
}
