<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Helpers\AuthContext; // Use Helper
use App\Services\ExamService;
use App\Services\MarksService;
use App\Models\Exam;
use App\Models\Term;
use Illuminate\Http\Request;

class ExamController extends Controller
{
    protected $exams;
    protected $marks;

    public function __construct(ExamService $exams, MarksService $marks)
    {
        $this->exams = $exams;
        $this->marks = $marks;
    }

    // Terms (Ideally separate controller but mixing for MVP speed per request grouping)
    public function currentTerms()
    {
        // Require auth
        $terms = Term::where('academic_year_id', 1) // Hardcoded 1 for MVP
            ->with('publication')
            ->orderBy('sort_order')
            ->get();
        return response()->json($terms);
    }

    public function createTerm(Request $request)
    {
        // Permission structure.manage usually or exams.schedule
        if (!AuthContext::hasPermission('exams.schedule'))
            abort(403);

        $data = $request->validate([
            'name' => 'required',
            'start_date' => 'required|date',
            'end_date' => 'required|date'
        ]);

        $term = Term::create([
            'academic_year_id' => 1,
            'name' => $data['name'],
            'start_date' => $data['start_date'],
            'end_date' => $data['end_date']
        ]);

        return response()->json($term, 201);
    }

    public function updatePublication(Request $request, int $termId)
    {
        if (!AuthContext::hasPermission('exams.publish'))
            abort(403);

        $data = $request->validate(['publish_at' => 'required|date']);
        $term = Term::findOrFail($termId);

        $pub = $term->publication()->updateOrCreate(
            ['term_id' => $term->id],
            [
                'publish_at' => $data['publish_at'],
                'created_by_user_id' => AuthContext::user()->id
            ]
        );

        return response()->json($pub);
    }

    // Exams
    public function createExam(Request $request)
    {
        if (!AuthContext::hasPermission('exams.schedule'))
            abort(403);

        $data = $request->validate([
            'section_id' => 'required|exists:sections,id',
            'subject_id' => 'required|integer',
            'term_id' => 'required|exists:terms,id',
            'exam_type' => 'required|in:UNIT,MIDTERM,FINAL',
            'exam_date' => 'required|date',
            'max_grade' => 'nullable|integer'
        ]);

        $exam = $this->exams->scheduleExam($data, AuthContext::user());
        return response()->json($exam, 201);
    }

    public function listBySection(Request $request, int $sectionId)
    {
        if (!AuthContext::hasPermission('exams.view'))
            abort(403);
        $termId = $request->query('term_id');
        if (!$termId)
            abort(400, 'term_id required');

        $user = AuthContext::user();
        if ($user->user_type === 'PARENT') {
            // Check publish
            $term = Term::find($termId);
            if (!$term || !$term->isPublished())
                abort(403, 'Not published yet');

            // Check child link
            $childId = $request->query('child_student_id');
            if (!$childId || !$user->guardian?->students()->where('students.id', $childId)->exists()) {
                abort(403, 'Child link required');
            }
        }

        return response()->json($this->exams->listForSection($sectionId, $termId));
    }

    public function show(int $id)
    {
        if (!AuthContext::hasPermission('exams.view'))
            abort(403);
        $exam = Exam::with(['marks'])->findOrFail($id);

        $user = AuthContext::user();
        if ($user->user_type === 'PARENT') {
            if (!$exam->term->isPublished())
                abort(403, 'Not published');
            // TODO: Filter marks to show only child?? 
            // Requirement says "for parent return only child's mark".
            // We'll filter `marks` collection.
            $childIds = $user->guardian?->students()->pluck('students.id')->toArray();
            $exam->setRelation('marks', $exam->marks->whereIn('student_id', $childIds)->values());
        }

        return response()->json($exam);
    }

    public function updateMarks(Request $request, int $id)
    {
        if (!AuthContext::hasPermission('exams.marks.update'))
            abort(403);

        $exam = Exam::findOrFail($id);
        $data = $request->validate([
            'marks' => 'required|array',
            'marks.*.student_id' => 'required|integer',
            'marks.*.grade_letter' => 'required|string',
            'marks.*.remarks' => 'nullable|string',
            'marks.*.skill_ratings_json' => 'nullable|array'
        ]);

        $this->marks->upsertMarks($exam, $data['marks'], AuthContext::user());
        return response()->json(['status' => 'ok']);
    }
}
