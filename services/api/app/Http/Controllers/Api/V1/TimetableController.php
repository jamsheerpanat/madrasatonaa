<?php

namespace App\Http\Controllers\Api\V1;

use App\Helpers\AuthContext;
use App\Http\Controllers\Controller;
use App\Services\PeriodTemplateService;
use App\Services\TimetableService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TimetableController extends Controller
{
    protected $timetableService;
    protected $periodService;

    public function __construct(TimetableService $timetableService, PeriodTemplateService $periodService)
    {
        $this->timetableService = $timetableService;
        $this->periodService = $periodService;
    }

    // --- Templates ---

    public function getTemplate(Request $request, int $branchId): JsonResponse
    {
        // Permission check: timetable.view
        // Branch check: already done by middleware if route grouped? 
        // We will manually group routes.

        $template = $this->periodService->getActiveTemplate($branchId);
        return response()->json($template);
    }

    public function updateTemplate(Request $request, int $branchId): JsonResponse
    {
        // permission: timetable.manage
        $validated = $request->validate([
            'periods_per_day' => 'required|integer|min:1|max:12',
            'period_times' => 'nullable|array',
        ]);

        $template = $this->periodService->upsertActiveTemplate(
            $branchId,
            $validated['periods_per_day'],
            $validated['period_times'] ?? []
        );

        return response()->json($template);
    }

    // --- Timetables ---

    public function getSectionTimetable(Request $request, int $sectionId): JsonResponse
    {
        $user = $request->user();

        // Security: If student, they can only see their own section
        if ($user->user_type === 'STUDENT') {
            $enrollment = \App\Models\Enrollment::where('student_id', $user->student?->id)
                ->where('section_id', $sectionId)
                ->where('status', 'ACTIVE')
                ->first();

            if (!$enrollment) {
                return response()->json(['message' => 'Access denied to this section timetable.'], 403);
            }
        }

        $entries = $this->timetableService->getSectionTimetable($sectionId);
        return response()->json($entries);
    }

    public function updateSectionTimetable(Request $request, int $sectionId): JsonResponse
    {
        // Permission: timetable.manage
        $validated = $request->validate([
            'entries' => 'required|array',
            'entries.*.day_of_week' => 'required|in:SUN,MON,TUE,WED,THU,FRI,SAT',
            'entries.*.period_no' => 'required|integer',
            'entries.*.subject_id' => 'required|integer',
            'entries.*.teacher_user_id' => 'nullable|integer',
            'entries.*.room_name' => 'nullable|string',
        ]);

        $result = $this->timetableService->upsertSectionTimetable($sectionId, $validated['entries']);
        return response()->json($result);
    }

    public function getMyTimetable(Request $request): JsonResponse
    {
        $user = $request->user();
        if ($user->user_type !== 'STAFF') {
            // Maybe student later?
            return response()->json([]);
        }

        $timetable = $this->timetableService->getTeacherTimetable($user->id);
        return response()->json($timetable);
    }

    public function getChildTimetable(Request $request, int $studentId): JsonResponse
    {
        // Parent check
        $user = $request->user();
        // Ensure child linked
        if ($user->user_type === 'PARENT') {
            $user->load('guardian.students');
            if (!$user->guardian || !$user->guardian->students->contains('id', $studentId)) {
                abort(403, 'Access denied to this student timetable.');
            }
        } else {
            // Staff? Staff should use section view mostly. But acceptable if scoped.
        }

        // Get Active Section
        $enrollment = \App\Models\Enrollment::where('student_id', $studentId)
            ->where('status', 'ACTIVE')
            ->latest()
            ->first();

        if (!$enrollment) {
            return response()->json([], 404); // No active section
        }

        $timetable = $this->timetableService->getSectionTimetable($enrollment->section_id);
        return response()->json($timetable);
    }
}
