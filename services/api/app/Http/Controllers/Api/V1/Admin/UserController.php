<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\UserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    protected $userService;

    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    public function index(Request $request): JsonResponse
    {
        try {
            $role = $request->query('role');
            $type = $request->query('user_type');
            $query = User::with(['roles', 'staffProfile', 'guardian']);

            if ($role) {
                $query->whereHas('roles', function ($q) use ($role) {
                    $q->where('name', $role);
                });
            }

            if ($type) {
                $query->where('user_type', $type);
            }

            return response()->json($query->paginate(100)); // Increased pagination for dropdowns
        } catch (\Exception $e) {
            \Log::error("User Index Error: " . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function show($id): JsonResponse
    {
        $user = User::with(['roles', 'staffProfile', 'guardian.students'])->findOrFail($id);
        return response()->json($user);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'full_name' => 'required|string|max:255',
            'email' => 'nullable|email|unique:users,email',
            'phone' => 'nullable|string|unique:users,phone',
            'password' => 'nullable|string|min:6',
            'user_type' => 'required|in:STAFF,PARENT,STUDENT',
            'branch_id' => 'nullable|exists:branches,id', // Context for role/staff
            'roles' => 'array',
            'roles.*' => 'exists:roles,name',
            // Optional fields
            'employee_code' => 'nullable|string',
            'job_title' => 'nullable|string',
            'national_id' => 'nullable|string',
        ]);

        $user = $this->userService->createUser($validated);

        return response()->json($user, 201);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'full_name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|unique:users,phone,' . $user->id,
            'password' => 'nullable|string|min:6',
            'user_type' => 'sometimes|in:STAFF,PARENT,STUDENT',
            'branch_id' => 'nullable|exists:branches,id',
            'roles' => 'sometimes|array',
            'roles.*' => 'exists:roles,name',
            // Optional fields
            'employee_code' => 'nullable|string',
            'job_title' => 'nullable|string',
            'national_id' => 'nullable|string',
        ]);

        $user = $this->userService->updateUser($user, $validated);

        return response()->json($user);
    }

    public function resetPassword(Request $request, $id): JsonResponse
    {
        $request->validate([
            'password' => 'required|string|min:6',
        ]);

        $user = User::findOrFail($id);
        $this->userService->resetPassword($user, $request->password);

        return response()->json(['message' => 'Password reset successfully']);
    }
}
