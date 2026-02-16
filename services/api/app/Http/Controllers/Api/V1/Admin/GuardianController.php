<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Guardian;
use App\Models\Role;
use App\Models\Student;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class GuardianController extends Controller
{
    public function index(Request $request)
    {
        $query = Guardian::with(['user', 'students']);

        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('username', 'like', "%{$search}%");
            })->orWhere('national_id', 'like', "%{$search}%");
        }

        $guardians = $query->paginate(15);

        return response()->json($guardians);
    }

    public function show($id)
    {
        $guardian = Guardian::with(['user', 'students.user', 'students.currentEnrollment.section.grade'])->findOrFail($id);
        return response()->json($guardian);
    }

    public function store(Request $request)
    {
        $request->validate([
            'full_name' => 'required|string|max:255',
            'username' => 'nullable|string|max:50|unique:users,username',
            'email' => 'nullable|email|unique:users,email',
            'phone' => 'nullable|string|max:20',
            'national_id' => 'nullable|string|max:50',
            'password' => 'required|string|min:6',
        ]);

        DB::beginTransaction();
        try {
            // Create User
            $user = User::create([
                'full_name' => $request->full_name,
                'username' => $request->username,
                'email' => $request->email,
                'phone' => $request->phone,
                'password' => Hash::make($request->password),
                'user_type' => 'PARENT',
                'is_active' => true,
            ]);

            // Assign Role
            $parentRole = Role::where('name', 'Parent')->first();
            if ($parentRole) {
                $user->roles()->attach($parentRole->id);
            }

            // Create Guardian Profile
            $guardian = Guardian::create([
                'user_id' => $user->id,
                'national_id' => $request->national_id,
            ]);

            DB::commit();

            return response()->json($guardian->load('user'), 201);
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function update(Request $request, $id)
    {
        $guardian = Guardian::findOrFail($id);
        $user = $guardian->user;

        $request->validate([
            'full_name' => 'required|string|max:255',
            'username' => 'nullable|string|max:50|unique:users,username,' . $user->id,
            'email' => 'nullable|email|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:20',
            'national_id' => 'nullable|string|max:50',
            'password' => 'nullable|string|min:6',
        ]);

        DB::beginTransaction();
        try {
            $user->update([
                'full_name' => $request->full_name,
                'username' => $request->username,
                'email' => $request->email,
                'phone' => $request->phone,
            ]);

            if ($request->filled('password')) {
                $user->update(['password' => Hash::make($request->password)]);
            }

            $guardian->update([
                'national_id' => $request->national_id,
            ]);

            DB::commit();

            return response()->json($guardian->load('user'));
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function linkStudent(Request $request, $id)
    {
        $request->validate([
            'student_id' => 'required|exists:students,id',
            'relationship' => 'required|string',
        ]);

        $guardian = Guardian::findOrFail($id);

        // Use user_id for the pivot because that's how the relation is defined in StudentGuardian pivot logic usually
        // But wait, Guardian model uses 'user_id' as local key in relation definition?
        // RELATION in Guardian.php: belongsToMany(Student, student_guardians, guardian_user_id, student_id, user_id, id)
        // So we attach to the relation.

        // Pivot table columns: student_id, guardian_user_id, relationship, is_primary

        // Check if already attached
        $exists = DB::table('student_guardians')
            ->where('student_id', $request->student_id)
            ->where('guardian_user_id', $guardian->user_id)
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Student already linked'], 422);
        }

        $guardian->students()->attach($request->student_id, [
            'relationship' => $request->relationship,
            'is_primary' => $request->boolean('is_primary', false),
            'guardian_user_id' => $guardian->user_id // Explicitly setting this if the relation doesn't handle it automatically or to be safe
        ]);

        return response()->json(['message' => 'Student linked successfully']);
    }

    public function unlinkStudent($id, $studentId)
    {
        $guardian = Guardian::findOrFail($id);
        $guardian->students()->detach($studentId);

        return response()->json(['message' => 'Student unlinked successfully']);
    }
}
