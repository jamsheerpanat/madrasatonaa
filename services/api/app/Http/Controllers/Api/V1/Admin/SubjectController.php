<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Subject;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SubjectController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $subjects = Subject::with('branch')->get();
        return response()->json($subjects);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'branch_id' => 'required|exists:branches,id',
            'code' => 'required|string|unique:subjects,code',
            'name_en' => 'required|string',
            'name_ar' => 'nullable|string',
            'type' => 'required|in:MANDATORY,ELECTIVE,EXTRA_CURRICULAR',
            'credits' => 'required|integer|min:0',
            'passing_marks' => 'required|integer|min:0',
            'max_marks' => 'required|integer|min:1',
            'description' => 'nullable|string',
        ]);

        // Map legacy 'name' for backward compatibility
        $data = $validated;
        if (!isset($data['name'])) {
            $data['name'] = $data['name_en'];
        }

        $subject = Subject::create($data);

        return response()->json($subject, 201);
    }

    public function show(int $subject): JsonResponse
    {
        $subjectModel = Subject::findOrFail($subject);
        return response()->json($subjectModel);
    }

    public function update(Request $request, int $subject): JsonResponse
    {
        $subjectModel = Subject::findOrFail($subject);

        $validated = $request->validate([
            'branch_id' => 'exists:branches,id',
            'code' => 'string|unique:subjects,code,' . $subject,
            'name_en' => 'string',
            'name_ar' => 'nullable|string',
            'type' => 'in:MANDATORY,ELECTIVE,EXTRA_CURRICULAR',
            'credits' => 'integer|min:0',
            'passing_marks' => 'integer|min:0',
            'max_marks' => 'integer|min:1',
            'description' => 'nullable|string',
        ]);

        $subjectModel->update($validated);

        return response()->json($subjectModel);
    }

    public function destroy(int $subject): JsonResponse
    {
        $subjectModel = Subject::findOrFail($subject);
        $subjectModel->delete();
        return response()->json(null, 204);
    }
}
