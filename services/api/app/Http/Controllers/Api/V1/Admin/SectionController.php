<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Section;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SectionController extends Controller
{
    /**
     * Store a new section.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'grade_id' => 'required|exists:grades,id',
            'name' => 'required|string|max:255',
            'capacity' => 'required|integer|min:1',
            'class_teacher_id' => 'nullable|exists:users,id',
        ]);

        $section = Section::create($validated);

        return response()->json([
            'message' => 'Section created successfully',
            'section' => $section->load('classTeacher')
        ], 201);
    }

    /**
     * Update an existing section.
     */
    public function update(Request $request, int $section): JsonResponse
    {
        $sectionModel = Section::findOrFail($section);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'capacity' => 'sometimes|required|integer|min:1',
            'class_teacher_id' => 'nullable|exists:users,id',
        ]);

        $sectionModel->update($validated);

        return response()->json([
            'message' => 'Section updated successfully',
            'section' => $sectionModel->load('classTeacher')
        ]);
    }

    /**
     * Remove a section.
     */
    public function destroy(int $section): JsonResponse
    {
        $sectionModel = Section::findOrFail($section);

        // Check for enrollments
        if ($sectionModel->enrollments()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete section with active enrollments'
            ], 422);
        }

        $sectionModel->delete();

        return response()->json([
            'message' => 'Section deleted successfully'
        ]);
    }
}
