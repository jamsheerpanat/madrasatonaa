<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

class NotificationService
{
    /**
     * Stub for notifying a specific user.
     * Logs intent to system log.
     */
    public function notifyUser(int $userId, string $type, array $payload)
    {
        Log::info("NOTIFICATION [User:$userId] Type:$type Payload:" . json_encode($payload));
    }

    /**
     * Stub for notifying a role within a branch.
     * Logs intent to system log.
     */
    public function notifyRole(int $branchId, string $roleName, string $type, array $payload)
    {
        Log::info("NOTIFICATION [Role:$roleName Branch:$branchId] Type:$type Payload:" . json_encode($payload));
    }
}
