<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Http\JsonResponse;

class RoleController extends Controller
{
    public function __invoke(): JsonResponse
    {
        // Not used as single invokable, but let's just make it return roles for index
        return response()->json(Role::with('permissions')->get());
    }

    public function permissions(): JsonResponse
    {
        return response()->json(Permission::all()->groupBy('module'));
    }
}
