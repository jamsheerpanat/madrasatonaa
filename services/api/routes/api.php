<?php

use App\Http\Controllers\Api\V1\Admin\RoleController;
use App\Http\Controllers\Api\V1\Admin\StudentController;
use App\Http\Controllers\Api\V1\Admin\UserController;
use App\Http\Controllers\Api\V1\Auth\ParentAuthController;
use App\Http\Controllers\Api\V1\Auth\SessionController;
use App\Http\Controllers\Api\V1\Auth\StaffAuthController;
use App\Http\Controllers\Api\V1\Internal\TimelineTestController;
use App\Http\Controllers\Api\V1\MeController;
use App\Http\Controllers\Api\V1\Parent\ChildController;
use App\Http\Controllers\Api\V1\Principal\RhythmController;
use App\Http\Controllers\Api\V1\StructureController;
use App\Http\Controllers\Api\V1\TimelineController;
use App\Http\Controllers\Api\V1\TimetableController;
use App\Http\Controllers\Api\V1\AttendanceController;
use App\Http\Controllers\Api\V1\BroadcastController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // System
    Route::get('/health', function () {
        return response()->json([
            'status' => 'ok',
            'service' => 'madrasatonaa-api',
            'version' => '0.0.1',
        ]);
    });

    // Auth
    Route::prefix('auth')->group(function () {
        Route::post('/staff/login', [StaffAuthController::class, 'login']);
        // Route::post('/parent/request-otp', [ParentAuthController::class, 'requestOtp']);
        // Route::post('/parent/verify-otp', [ParentAuthController::class, 'verifyOtp']);
        Route::post('/parent/login', [ParentAuthController::class, 'login']);
        Route::post('/refresh', [SessionController::class, 'refresh']);
        Route::post('/logout', [SessionController::class, 'logout']);
    });

    // Public structure
    Route::get('/structure', [StructureController::class, 'index']);
    Route::get('/subjects', [StructureController::class, 'subjects']);
    Route::get('/sections', [StructureController::class, 'sections']);

    // Protected Routes
    Route::middleware(['auth:sanctum'])->group(function () {

        // Me
        Route::get('/me', MeController::class);

        // Timeline
        Route::get('/timeline', [TimelineController::class, 'index']);

        // Internal Dev Tools
        if (config('app.env') === 'local' || config('app.env') === 'testing') {
            Route::post('/internal/timeline/test-emit', [TimelineTestController::class, 'emit']);
        }

        // Principal Rhythm
        Route::get('/principal/rhythm', RhythmController::class)
            ->middleware('permission:principal.dashboard.view');

        // Timetable (Role based permissions inside controller or middleware)
        Route::prefix('timetable')->group(function () {
            // Staff
            Route::get('/branch/{branchId}/template', [TimetableController::class, 'getTemplate'])
                ->middleware(['branch_scope', 'permission:timetable.view']);
            Route::put('/branch/{branchId}/template', [TimetableController::class, 'updateTemplate'])
                ->middleware(['branch_scope', 'permission:timetable.manage']);

            Route::get('/section/{sectionId}', [TimetableController::class, 'getSectionTimetable'])
                ->middleware(['branch_scope', 'permission:timetable.view']);
            Route::put('/section/{sectionId}', [TimetableController::class, 'updateSectionTimetable'])
                ->middleware(['branch_scope', 'permission:timetable.manage']);

            Route::get('/teacher/me', [TimetableController::class, 'getMyTimetable'])
                ->middleware(['permission:timetable.view']);

            // Parent
            Route::get('/parent/child/{studentId}', [TimetableController::class, 'getChildTimetable'])
                ->middleware(['permission:timetable.view']);
        });

        // Attendance
        Route::prefix('attendance')->group(function () {
            Route::get('/stats', [AttendanceController::class, 'getStats']);
            // Section Days
            Route::get('/section/{sectionId}/day', [AttendanceController::class, 'getDay']);
            Route::post('/section/{sectionId}/day', [AttendanceController::class, 'createDay']);

            // Marking
            Route::put('/day/{id}/mark', [AttendanceController::class, 'markDay']);
            Route::post('/day/{id}/submit', [AttendanceController::class, 'submitDay']);

            // Student / Parent
            Route::get('/child/{studentId?}/month', [AttendanceController::class, 'getChildMonth']);
            Route::post('/parent/justify', [AttendanceController::class, 'submitJustification']);

            // Admin/Review
            Route::post('/justifications/{id}/review', [AttendanceController::class, 'reviewJustification']);
        });

        // Broadcasts (Announcements & Memos)
        Route::prefix('broadcasts')->group(function () {
            Route::get('/announcements', [BroadcastController::class, 'getAnnouncements']);
            Route::post('/announcements', [BroadcastController::class, 'createAnnouncement']);

            Route::get('/memos', [BroadcastController::class, 'getMemos']);
            Route::get('/memos/pending-count', [BroadcastController::class, 'getPendingCount']);
            Route::post('/memos', [BroadcastController::class, 'createMemo']);
            Route::post('/memos/{id}/ack', [BroadcastController::class, 'ackMemo']);

            // Dev
            Route::post('/internal/publish-scheduled', [BroadcastController::class, 'publishScheduled']);
        });

        // Assignments
        Route::prefix('assignments')->group(function () {
            Route::post('/', [App\Http\Controllers\Api\V1\AssignmentController::class, 'create']);
            Route::get('/mine', [App\Http\Controllers\Api\V1\AssignmentController::class, 'listMine']);
            Route::get('/section/{sectionId}', [App\Http\Controllers\Api\V1\AssignmentController::class, 'listBySection']);
            Route::get('/{id}', [App\Http\Controllers\Api\V1\AssignmentController::class, 'show']);
            Route::post('/{id}/submit', [App\Http\Controllers\Api\V1\AssignmentController::class, 'submit']);
            Route::get('/{id}/submissions', [App\Http\Controllers\Api\V1\AssignmentController::class, 'listSubmissions']);
        });

        Route::post('/submissions/{id}/grade', [App\Http\Controllers\Api\V1\AssignmentController::class, 'gradeSubmission']);

        // Terms
        Route::prefix('terms')->group(function () {
            Route::get('/current', [App\Http\Controllers\Api\V1\ExamController::class, 'currentTerms']);
            Route::post('/', [App\Http\Controllers\Api\V1\ExamController::class, 'createTerm']);
            Route::put('/{id}/publication', [App\Http\Controllers\Api\V1\ExamController::class, 'updatePublication']);
        });

        // Exams
        Route::prefix('exams')->group(function () {
            Route::post('/', [App\Http\Controllers\Api\V1\ExamController::class, 'createExam']);
            Route::get('/section/{sectionId}', [App\Http\Controllers\Api\V1\ExamController::class, 'listBySection']);
            Route::get('/{id}', [App\Http\Controllers\Api\V1\ExamController::class, 'show']);
            Route::put('/{id}/marks', [App\Http\Controllers\Api\V1\ExamController::class, 'updateMarks']);
        });

        // Tickets
        Route::prefix('tickets')->group(function () {
            Route::get('/categories', [App\Http\Controllers\Api\V1\TicketController::class, 'categories']);
            Route::get('/', [App\Http\Controllers\Api\V1\TicketController::class, 'index']);
            Route::post('/', [App\Http\Controllers\Api\V1\TicketController::class, 'create']);
            Route::get('/{id}', [App\Http\Controllers\Api\V1\TicketController::class, 'show']);
            Route::post('/{id}/reply', [App\Http\Controllers\Api\V1\TicketController::class, 'reply']);
            Route::post('/{id}/status', [App\Http\Controllers\Api\V1\TicketController::class, 'changeStatus']);
        });

        // Files
        Route::prefix('files')->group(function () {
            Route::post('/init-upload', [App\Http\Controllers\Api\V1\FileController::class, 'initUpload']);
            Route::post('/finalize', [App\Http\Controllers\Api\V1\FileController::class, 'finalize']);
            Route::get('/{id}/download-url', [App\Http\Controllers\Api\V1\FileController::class, 'getDownloadUrl']);
        });

        // Admin Endpoints
        Route::prefix('admin')->middleware(['branch_scope'])->group(function () {

            Route::middleware('permission:admin.roles.manage')->group(function () {
                Route::get('/roles', [RoleController::class, '__invoke']);
            });

            Route::middleware('permission:admin.permissions.manage')->group(function () {
                Route::get('/permissions', [RoleController::class, 'permissions']);
            });

            Route::middleware('permission:admin.users.manage')->group(function () {
                Route::get('/users', [UserController::class, 'index']);
                Route::post('/users', [UserController::class, 'store']);
                Route::get('/users/{id}', [UserController::class, 'show']);
                Route::post('/users/{id}/reset-password', [UserController::class, 'resetPassword']);
                Route::put('/users/{id}', [UserController::class, 'update']);
            });

            Route::apiResource('subjects', App\Http\Controllers\Api\V1\Admin\SubjectController::class)
                ->middleware('permission:structure.manage');

            Route::post('/students', [StudentController::class, 'store'])
                ->middleware('permission:students.create');

            Route::get('/students', [StudentController::class, 'index'])
                ->middleware('permission:students.view');

            Route::get('/students/{id}', [StudentController::class, 'show'])
                ->middleware('permission:students.view');

            Route::put('/students/{id}', [StudentController::class, 'update'])
                ->middleware('permission:students.update');

            Route::post('/guardians/link', [StudentController::class, 'linkGuardian'])
                ->middleware('permission:students.update');

            Route::post('/students/{id}/add-guardian', [StudentController::class, 'addGuardian'])
                ->middleware('permission:students.update');

            // Guardian Management
            Route::prefix('guardians')->group(function () {
                Route::get('/', [App\Http\Controllers\Api\V1\Admin\GuardianController::class, 'index']);
                Route::post('/', [App\Http\Controllers\Api\V1\Admin\GuardianController::class, 'store']);
                Route::get('/{id}', [App\Http\Controllers\Api\V1\Admin\GuardianController::class, 'show']);
                Route::put('/{id}', [App\Http\Controllers\Api\V1\Admin\GuardianController::class, 'update']);
                Route::post('/{id}/link-student', [App\Http\Controllers\Api\V1\Admin\GuardianController::class, 'linkStudent']);
                Route::delete('/{id}/link-student/{studentId}', [App\Http\Controllers\Api\V1\Admin\GuardianController::class, 'unlinkStudent']);
            });

            Route::delete('/students/{id}/guardians/{guardianId}', [StudentController::class, 'unlinkGuardian'])
                ->middleware('permission:students.update');

            Route::put('/students/{id}/guardians/{guardianId}', [StudentController::class, 'updateGuardian'])
                ->middleware('permission:students.update');


            Route::apiResource('branches', App\Http\Controllers\Api\V1\Admin\BranchController::class)
                ->middleware('permission:structure.manage');

            Route::apiResource('grades', App\Http\Controllers\Api\V1\Admin\GradeController::class)
                ->middleware('permission:structure.manage');

            Route::apiResource('sections', App\Http\Controllers\Api\V1\Admin\SectionController::class)
                ->middleware('permission:structure.manage');

            Route::get('/sections/{section}/subjects', [App\Http\Controllers\Api\V1\Admin\SectionSubjectController::class, 'index'])
                ->middleware('permission:structure.manage');
            Route::post('/sections/{section}/subjects', [App\Http\Controllers\Api\V1\Admin\SectionSubjectController::class, 'sync'])
                ->middleware('permission:structure.manage');
            Route::delete('/sections/{section}/subjects/{subject}', [App\Http\Controllers\Api\V1\Admin\SectionSubjectController::class, 'destroy'])
                ->middleware('permission:structure.manage');
        });

        // Parent Endpoints
        Route::prefix('parent')->group(function () {
            Route::get('/children', [ChildController::class, 'index']);
        });
    });
});
