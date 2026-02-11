<?php

namespace App\Http\Controllers\Api\V1;

use App\Helpers\AuthContext;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MeController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->load(['roles.permissions']);

        $permissions = [];
        $rolesData = [];

        foreach ($user->roles as $role) {
            $rolesData[] = [
                'name' => $role->name,
                'branch_id' => $role->pivot->branch_id,
            ];
            foreach ($role->permissions as $p) {
                $permissions[] = $p->key;
            }
        }

        $response = [
            'id' => $user->id,
            'full_name' => $user->full_name,
            'email' => $user->email,
            'phone' => $user->phone,
            'user_type' => $user->user_type,
            'user' => [
                'id' => $user->id,
                'full_name' => $user->full_name,
                'email' => $user->email,
                'phone' => $user->phone,
                'user_type' => $user->user_type,
            ],
            'roles' => $rolesData,
            'permissions' => array_values(array_unique($permissions)),
            'branch_scope_ids' => AuthContext::allowedBranchIds(),
        ];

        if ($user->user_type === 'STUDENT') {
            $user->load(['student.enrollments.section.grade']);
            $response['student'] = $user->student;
        } elseif ($user->user_type === 'STAFF') {
            $user->load('staffProfile');
            $response['staff'] = $user->staffProfile;
        }

        return response()->json($response);
    }
}
