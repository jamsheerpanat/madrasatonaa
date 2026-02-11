<?php

namespace App\Helpers;

use App\Models\Branch;
use App\Models\User;
use Illuminate\Support\Facades\Request;

class AuthContext
{
    protected static $resolvedRoles = null;
    protected static $resolvedPermissions = null;
    protected static $resolvedUserId = null;

    public static function reset()
    {
        self::$resolvedRoles = null;
        self::$resolvedPermissions = null;
        self::$resolvedUserId = null;
    }

    public static function user(): ?User
    {
        return Request::user();
    }

    public static function id(): ?int
    {
        return Request::user()?->id;
    }

    public static function type(): ?string
    {
        return Request::user()?->user_type;
    }

    protected static function checkCache()
    {
        $userId = self::id();
        if ($userId !== self::$resolvedUserId) {
            self::$resolvedRoles = null;
            self::$resolvedPermissions = null;
            self::$resolvedUserId = $userId;
        }
    }

    public static function isOfficeAdmin(): bool
    {
        $user = self::user();
        if (!$user)
            return false;

        self::checkCache();

        if (self::$resolvedRoles === null) {
            self::resolveRoles($user);
        }

        foreach (self::$resolvedRoles as $role) {
            if ($role['name'] === 'OfficeAdmin')
                return true;
        }

        return false;
    }

    public static function hasPermission(string $key): bool
    {
        $user = self::user();
        if (!$user)
            return false;

        self::checkCache();

        if (self::isOfficeAdmin())
            return true;

        if (self::$resolvedPermissions === null) {
            self::resolvePermissions($user);
        }

        return in_array($key, self::$resolvedPermissions ?? []);
    }

    public static function allowedBranchIds(): array
    {
        $user = self::user();
        if (!$user)
            return [];

        self::checkCache();

        if (self::isOfficeAdmin()) {
            return Branch::pluck('id')->toArray();
        }

        if (self::$resolvedRoles === null) {
            self::resolveRoles($user);
        }

        $branchIds = [];
        foreach (self::$resolvedRoles as $role) {
            if ($role['pivot_branch_id']) {
                $branchIds[] = $role['pivot_branch_id'];
            }
        }
        return array_unique($branchIds);
    }

    protected static function resolveRoles(User $user)
    {
        $user->loadMissing('roles');
        self::$resolvedRoles = $user->roles->map(function ($role) {
            return [
                'id' => $role->id,
                'name' => $role->name,
                'pivot_branch_id' => $role->pivot->branch_id,
            ];
        });
    }

    protected static function resolvePermissions(User $user)
    {
        $user->loadMissing('roles.permissions');
        $perms = [];
        foreach ($user->roles as $role) {
            foreach ($role->permissions as $perm) {
                $perms[] = $perm->key;
            }
        }
        self::$resolvedPermissions = array_unique($perms);
    }
}
