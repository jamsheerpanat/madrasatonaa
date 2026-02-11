<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Section;
use App\Models\SectionSubject;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SectionSubjectController extends Controller
{
    /**
     * Get all subjects assigned to a section.
     */
    public function index(int $sectionId): JsonResponse
    {
        $subjects = SectionSubject::where('section_id', $sectionId)
            ->with(['subject', 'teacher'])
            ->get();

        return response()->json($subjects);
    }

    /**
     * Assign subjects to a section or update teacher assignment.
     */
    public function sync(Request $request, int $sectionId): JsonResponse
    {
        $section = Section::findOrFail($sectionId);

        $validated = $request->validate([
            'subjects' => 'required|array',
            'subjects.*.subject_id' => 'required|exists:subjects,id',
            'subjects.*.teacher_user_id' => 'nullable|exists:users,id',
        ]);

        foreach ($validated['subjects'] as $item) {
            SectionSubject::updateOrCreate(
                ['section_id' => $section->id, 'subject_id' => $item['subject_id']],
                ['teacher_user_id' => $item['teacher_user_id'] ?? null]
            );
        }

        // Optional: Remove subjects not in the list if we want full sync
        // $keepIds = collect($validated['subjects'])->pluck('subject_id')->toArray();
        // SectionSubject::where('section_id', $section->id)->whereNotIn('subject_id', $keepIds)->delete();

        return response()->json([
            'message' => 'Section subjects updated successfully',
            'data' => $section->load('sectionSubjects.subject', 'sectionSubjects.teacher')
        ]);
    }

    /**
     * Remove a subject from a section.
     */
    public function destroy(int $sectionId, int $subjectId): JsonResponse
    {
        SectionSubject::where('section_id', $sectionId)
            ->where('subject_id', $subjectId)
            ->delete();

        return response()->json([
            'message' => 'Subject removed from section'
        ]);
    }
}
