<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use App\Models\Branch;
use App\Models\Grade;
use App\Models\SchoolSetting;
use App\Models\Subject;
use Illuminate\Http\JsonResponse;

class StructureController extends Controller
{
    /**
     * Get the full school academic structure.
     */
    public function index(): JsonResponse
    {
        return response()->json([
            'school_settings' => SchoolSetting::first(),
            'current_academic_year' => AcademicYear::where('is_current', true)->first(),
            'branches' => Branch::with([
                'grades.sections' => function ($q) {
                    $q->with(['classTeacher', 'enrollments', 'sectionSubjects.subject', 'sectionSubjects.teacher']);
                    $q->withCount('enrollments');
                },
                'subjects'
            ])->get(),
        ]);
    }

    public function subjects(): JsonResponse
    {
        return response()->json(Subject::all());
    }

    public function sections(): JsonResponse
    {
        return response()->json(\App\Models\Section::with('grade')->get());
    }
}
