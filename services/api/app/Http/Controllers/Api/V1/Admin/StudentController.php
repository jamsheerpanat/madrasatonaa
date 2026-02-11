<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Services\GuardianService;
use App\Services\StudentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Models\Student;

class StudentController extends Controller
{
    protected $studentService;
    protected $guardianService;

    public function __construct(StudentService $studentService, GuardianService $guardianService)
    {
        $this->studentService = $studentService;
        $this->guardianService = $guardianService;
    }

    public function index(Request $request): JsonResponse
    {
        $query = Student::with(['enrollments.section.grade', 'user']);

        if ($request->has('section_id') && $request->section_id) {
            $query->whereHas('enrollments', function ($q) use ($request) {
                $q->where('section_id', $request->section_id)->where('status', 'ACTIVE');
            });
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('first_name_en', 'like', "%{$search}%")
                    ->orWhere('last_name_en', 'like', "%{$search}%")
                    ->orWhere('admission_number', 'like', "%{$search}%");
            });
        }

        return response()->json($query->paginate(20));
    }

    public function show($id): JsonResponse
    {
        try {
            $student = Student::with([
                'user',
                'enrollments.section.grade',
                'guardians.user',
            ])->findOrFail($id);

            return response()->json($student);
        } catch (\Exception $e) {
            \Log::error("Error fetching student {$id}: " . $e->getMessage());
            \Log::error($e->getTraceAsString());
            return response()->json(['error' => 'Server Error: ' . $e->getMessage()], 500);
        }
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'student_code' => 'required|string|unique:students,admission_number',
                'full_name' => 'required|string',
                'section_id' => 'required|exists:sections,id',
                'academic_year_id' => 'required|exists:academic_years,id',
                'gender' => 'required|in:MALE,FEMALE',
                'dob' => 'required|date',
                'blood_group' => 'nullable|string|max:5',
                'address' => 'nullable|string',
                'email' => 'nullable|email',
                'phone' => 'nullable|string',
            ]);

            $student = $this->studentService->createStudent($validated);

            return response()->json($student, 201);
        } catch (\Illuminate\Validation\ValidationException $v) {
            return response()->json(['error' => 'Validation Failed', 'details' => $v->errors()], 422);
        } catch (\Exception $e) {
            \Log::error("Student Creation Error: " . $e->getMessage());
            \Log::error($e->getTraceAsString());
            return response()->json(['error' => 'Failed to create student: ' . $e->getMessage()], 500);
        }
    }

    public function linkGuardian(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'parent_user_id' => 'required|exists:users,id',
            'relationship' => 'required|in:FATHER,MOTHER,GUARDIAN,OTHER',
            'is_primary' => 'boolean',
        ]);

        $guardian = $this->guardianService->linkStudent($validated);

        return response()->json(['message' => 'Guardian linked successfully', 'guardian' => $guardian]);
    }

    /**
     * Create or Link a guardian to a student.
     */
    public function addGuardian(Request $request, int $studentId): JsonResponse
    {
        try {
            $validated = $request->validate([
                'full_name' => 'required|string|max:255',
                'relationship' => 'required|in:FATHER,MOTHER,GUARDIAN,OTHER',
                'email' => 'nullable|email',
                'phone' => 'nullable|string',
                'password' => 'nullable|string|min:6',
                'is_primary' => 'boolean',
            ]);

            // 1. Check if user already exists
            $user = null;
            if ($validated['phone']) {
                $user = \App\Models\User::where('phone', $validated['phone'])->first();
            } elseif ($validated['email']) {
                $user = \App\Models\User::where('email', $validated['email'])->first();
            }

            if (!$user) {
                // 2. Create New User & Guardian Profile
                $userData = [
                    'full_name' => $validated['full_name'],
                    'email' => $validated['email'],
                    'phone' => $validated['phone'],
                    'password' => $validated['password'] ?? 'password123', // Default if none
                    'user_type' => 'PARENT',
                    'roles' => ['Parent'],
                ];

                // Get branch from student to scope the role? 
                // Mostly parents are global or auto-linked to student branch.
                $student = Student::findOrFail($studentId);
                $enrollment = $student->enrollments()->where('status', 'ACTIVE')->first();
                if ($enrollment) {
                    $userData['branch_id'] = $enrollment->section->grade->branch_id;
                }

                $user = app(\App\Services\UserService::class)->createUser($userData);
            } else {
                // Ensure they have a guardian profile
                if (!$user->guardian) {
                    $user->guardian()->create();
                }
            }

            // 3. Link to student
            $this->guardianService->linkStudent([
                'student_id' => $studentId,
                'parent_user_id' => $user->id,
                'relationship' => $validated['relationship'],
                'is_primary' => $validated['is_primary'] ?? false
            ]);

            return response()->json([
                'message' => 'Guardian added successfully',
                'user' => $user->load('guardian')
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['error' => 'Validation Failed', 'details' => $e->errors()], 422);
        } catch (\Exception $e) {
            \Log::error("Add Guardian Error: " . $e->getMessage());
            return response()->json(['error' => 'Failed to add guardian: ' . $e->getMessage()], 500);
        }
    }

    public function unlinkGuardian(Request $request, int $studentId, int $guardianId): JsonResponse
    {
        try {
            $student = Student::findOrFail($studentId);
            $guardian = Guardian::findOrFail($guardianId);

            // We must detach using the user_id because that's what the relationship is linked on
            $student->guardians()->detach($guardian->user_id);

            return response()->json(['message' => 'Guardian unlinked successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to unlink guardian: ' . $e->getMessage()], 500);
        }
    }

    public function updateGuardian(Request $request, int $studentId, int $guardianId): JsonResponse
    {
        try {
            $validated = $request->validate([
                'full_name' => 'required|string|max:255',
                'relationship' => 'required|in:FATHER,MOTHER,GUARDIAN,OTHER',
                'email' => 'nullable|email',
                'phone' => 'nullable|string',
                'is_primary' => 'boolean',
            ]);

            $guardian = Guardian::findOrFail($guardianId);
            $user = $guardian->user;

            // Update user core info
            $user->update([
                'full_name' => $validated['full_name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
            ]);

            // Update the relationship in the pivot table
            $student = Student::findOrFail($studentId);
            $student->guardians()->updateExistingPivot($user->id, [
                'relationship' => $validated['relationship'],
                'is_primary' => $validated['is_primary'] ?? false
            ]);

            return response()->json(['message' => 'Guardian updated successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to update guardian: ' . $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id): JsonResponse
    {
        try {
            $student = Student::with('user')->findOrFail($id);

            $validated = $request->validate([
                'first_name_en' => 'required|string|max:255',
                'last_name_en' => 'required|string|max:255',
                'dob' => 'required|date',
                'gender' => 'required|in:MALE,FEMALE',
                'blood_group' => 'nullable|string|max:5',
                'address' => 'nullable|string',
                'email' => 'nullable|email|unique:users,email,' . ($student->user_id ?? 0),
                'phone' => 'nullable|string|unique:users,phone,' . ($student->user_id ?? 0),
            ]);

            // 1. Update Student specific fields
            $student->update([
                'first_name_en' => $validated['first_name_en'],
                'last_name_en' => $validated['last_name_en'],
                'dob' => $validated['dob'],
                'gender' => $validated['gender'] === 'MALE' ? 'M' : ($validated['gender'] === 'FEMALE' ? 'F' : null),
                'blood_group' => $validated['blood_group'],
                'address' => $validated['address'],
            ]);

            // 2. Update Linked User (Email/Phone)
            if ($student->user) {
                $student->user->update([
                    'full_name' => $validated['first_name_en'] . ' ' . $validated['last_name_en'],
                    'email' => $validated['email'],
                    'phone' => $validated['phone'],
                ]);
            }

            return response()->json(['message' => 'Student updated successfully', 'student' => $student->refresh()]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'error' => [
                    'message' => 'Validation failed',
                    'details' => $e->errors(),
                ]
            ], 422);
        } catch (\Exception $e) {
            \Log::error("Error updating student {$id}: " . $e->getMessage());
            return response()->json([
                'error' => [
                    'message' => 'An unexpected error occurred: ' . $e->getMessage(),
                ]
            ], 500);
        }
    }
}
