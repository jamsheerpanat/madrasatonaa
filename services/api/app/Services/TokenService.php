<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Str;

class TokenService
{
    /**
     * Generate an access token using Sanctum.
     * Sanctum tokens are long-lived by default, but we treat them as access tokens.
     * Expiry is handled by tokenable settings but here we return a plain text token.
     */
    public function generateAccessToken(User $user, string $deviceId)
    {
        // Revoke old access tokens for this device if needed, or allow concurrent
        // For simplicity, we just issue a new one. 
        // We scope it to the device_id if possible via token name

        $token = $user->createToken($deviceId);

        return [
            'token' => $token->plainTextToken,
            'expires_in' => config('sanctum.expiration') * 60, // minutes to seconds
        ];
    }

    public function generateRefreshToken(): string
    {
        return Str::random(64);
    }

    public function hashRefreshToken(string $token): string
    {
        return hash('sha256', $token);
    }

    public function validateRefreshToken(string $token, string $hash): bool
    {
        return hash('sha256', $token) === $hash;
    }
}
