<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Grade;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GradeController extends Controller
{
    /**
     * Store a new grade.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'branch_id' => 'required|exists:branches,id',
            'name' => 'required|string|max:255',
            'level_type' => 'required|string|in:KG,Primary,Middle,High',
            'sort_order' => 'nullable|integer',
        ]);

        $grade = Grade::create($validated);

        return response()->json([
            'message' => 'Grade created successfully',
            'grade' => $grade
        ], 201);
    }

    /**
     * Update an existing grade.
     */
    public function update(Request $request, int $grade): JsonResponse
    {
        $gradeModel = Grade::findOrFail($grade);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'level_type' => 'sometimes|required|string|in:KG,Primary,Middle,High',
            'sort_order' => 'nullable|integer',
        ]);

        $gradeModel->update($validated);

        return response()->json([
            'message' => 'Grade updated successfully',
            'grade' => $gradeModel
        ]);
    }

    /**
     * Remove a grade.
     */
    public function destroy(int $grade): JsonResponse
    {
        $gradeModel = Grade::findOrFail($grade);

        // Check if grade has sections
        if ($gradeModel->sections()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete grade with existing sections'
            ], 422);
        }

        $gradeModel->delete();

        return response()->json([
            'message' => 'Grade deleted successfully'
        ]);
    }
}
