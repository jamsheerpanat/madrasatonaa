<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BranchController extends Controller
{
    /**
     * Update an existing branch.
     */
    public function update(Request $request, int $branch): JsonResponse
    {
        $branchModel = Branch::findOrFail($branch);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'code' => 'sometimes|required|string|unique:branches,code,' . $branch,
            'address' => 'nullable|string',
            'phone' => 'nullable|string',
            'email' => 'nullable|email',
            'is_active' => 'sometimes|boolean',
        ]);

        $branchModel->update($validated);

        return response()->json([
            'message' => 'Branch updated successfully',
            'branch' => $branchModel
        ]);
    }

    /**
     * Store a new branch.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|unique:branches,code',
            'address' => 'nullable|string',
            'phone' => 'nullable|string',
            'email' => 'nullable|email',
            'is_active' => 'boolean',
        ]);

        $branch = Branch::create($validated);

        return response()->json([
            'message' => 'Branch created successfully',
            'branch' => $branch
        ], 201);
    }

    /**
     * Remove a branch.
     */
    public function destroy(int $id): JsonResponse
    {
        $branch = Branch::findOrFail($id);

        // Check if branch has grades or subjects
        if ($branch->grades()->count() > 0 || $branch->subjects()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete branch with existing grades or subjects'
            ], 422);
        }

        $branch->delete();

        return response()->json([
            'message' => 'Branch deleted successfully'
        ]);
    }
}
