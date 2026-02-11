<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            // Structure
            ['module' => 'structure', 'action' => 'view', 'key' => 'structure.view'],
            ['module' => 'structure', 'action' => 'manage', 'key' => 'structure.manage'],

            // Students
            ['module' => 'students', 'action' => 'view', 'key' => 'students.view'],
            ['module' => 'students', 'action' => 'create', 'key' => 'students.create'],
            ['module' => 'students', 'action' => 'update', 'key' => 'students.update'],
            ['module' => 'students', 'action' => 'archive', 'key' => 'students.archive'],
            ['module' => 'students', 'action' => 'import', 'key' => 'students.import'],
            ['module' => 'students', 'action' => 'export', 'key' => 'students.export'],

            // Timetable
            ['module' => 'timetable', 'action' => 'view', 'key' => 'timetable.view'],
            ['module' => 'timetable', 'action' => 'manage', 'key' => 'timetable.manage'],

            // Attendance
            ['module' => 'attendance', 'action' => 'view', 'key' => 'attendance.view'],
            ['module' => 'attendance', 'action' => 'record', 'key' => 'attendance.record'],
            ['module' => 'attendance', 'action' => 'submit', 'key' => 'attendance.submit'],
            ['module' => 'attendance', 'action' => 'export', 'key' => 'attendance.export'],
            ['module' => 'attendance', 'action' => 'justification.submit', 'key' => 'attendance.justification.submit'], // New
            ['module' => 'attendance', 'action' => 'justification.review', 'key' => 'attendance.justification.review'],

            // Assignments
            ['module' => 'assignments', 'action' => 'view', 'key' => 'assignments.view'],
            ['module' => 'assignments', 'action' => 'create', 'key' => 'assignments.create'],
            ['module' => 'assignments', 'action' => 'submit', 'key' => 'assignments.submit'],
            ['module' => 'assignments', 'action' => 'review', 'key' => 'assignments.review'],

            // Exams
            ['module' => 'exams', 'action' => 'view', 'key' => 'exams.view'],
            ['module' => 'exams', 'action' => 'schedule', 'key' => 'exams.schedule'],
            ['module' => 'exams', 'action' => 'marks.update', 'key' => 'exams.marks.update'],
            ['module' => 'exams', 'action' => 'publish', 'key' => 'exams.publish'],

            // Announcements
            ['module' => 'announcements', 'action' => 'view', 'key' => 'announcements.view'],
            ['module' => 'announcements', 'action' => 'publish', 'key' => 'announcements.publish'],

            // Memos
            ['module' => 'memos', 'action' => 'view', 'key' => 'memos.view'],
            ['module' => 'memos', 'action' => 'publish', 'key' => 'memos.publish'],
            ['module' => 'memos', 'action' => 'ack', 'key' => 'memos.ack'],

            // Tickets
            ['module' => 'tickets', 'action' => 'create', 'key' => 'tickets.create'],
            ['module' => 'tickets', 'action' => 'view', 'key' => 'tickets.view'],
            ['module' => 'tickets', 'action' => 'reply', 'key' => 'tickets.reply'],
            ['module' => 'tickets', 'action' => 'resolve', 'key' => 'tickets.resolve'],

            // Admin Ops
            ['module' => 'admin_ops', 'action' => 'users.manage', 'key' => 'admin.users.manage'],
            ['module' => 'admin_ops', 'action' => 'roles.manage', 'key' => 'admin.roles.manage'],
            ['module' => 'admin_ops', 'action' => 'permissions.manage', 'key' => 'admin.permissions.manage'],
            ['module' => 'admin_ops', 'action' => 'backups.manage', 'key' => 'admin.backups.manage'],

            // Principal Dashboard
            ['module' => 'dashboard', 'action' => 'principal.view', 'key' => 'principal.dashboard.view'],
        ];

        // 1. Create Permissions
        foreach ($permissions as $perm) {
            Permission::firstOrCreate(['key' => $perm['key']], $perm);
        }

        // 2. Assign Defaults to Roles
        $this->assignPermissions();
    }

    private function assignPermissions()
    {
        // Helper to find perm IDs
        $p = fn($keys) => Permission::whereIn('key', $keys)->pluck('id');

        // OfficeAdmin: ALL
        $officeAdmin = Role::where('name', 'OfficeAdmin')->first();
        if ($officeAdmin) {
            $officeAdmin->permissions()->sync(Permission::pluck('id'));
        }

        // Principal
        $principal = Role::where('name', 'Principal')->first();
        if ($principal) {
            $principal->permissions()->sync($p([
                'structure.view',
                'structure.manage',
                'students.view',
                'students.create',
                'students.update',
                'students.export',
                'timetable.manage',
                'timetable.view',
                'attendance.view',
                'attendance.export',
                'attendance.justification.review',
                'assignments.view',
                'exams.view',
                'announcements.publish',
                'memos.publish',
                'tickets.view',
                'admin.users.manage',
                'principal.dashboard.view',
            ]));
        }

        // VicePrincipal
        $vp = Role::where('name', 'VicePrincipal')->first();
        if ($vp) {
            $vp->permissions()->sync($p([
                'structure.view',
                'structure.manage',
                'students.view',
                'timetable.manage',
                'timetable.view',
                'attendance.view',
                'attendance.justification.review',
                'assignments.view',
                'exams.view',
                'principal.dashboard.view',
            ]));
        }

        // HOD
        $hod = Role::where('name', 'HOD')->first();
        if ($hod) {
            $hod->permissions()->sync($p([
                'structure.view',
                'students.view',
                'timetable.manage',
                'timetable.view',
                'attendance.view',
                'attendance.record',
                'attendance.justification.review',
                'attendance.justification.review',
                'assignments.view',
                'assignments.review',
                'exams.view',
                'exams.schedule',
                'exams.publish',
                'exams.publish',
                'exams.marks.update', // optional
                'tickets.view',
                'tickets.reply',
                'tickets.resolve',
                'principal.dashboard.view',
            ]));
        }

        // Teacher
        $teacher = Role::where('name', 'Teacher')->first();
        if ($teacher) {
            $teacher->permissions()->sync($p([
                'timetable.view',
                'attendance.view',
                'attendance.record',
                'attendance.submit',
                'assignments.view',
                'assignments.create',
                'assignments.review',
                'exams.view',
                'exams.marks.update',
                'announcements.publish',
                'memos.publish',
                'tickets.view',
                'tickets.reply'
            ]));
        }

        // Parent
        $parent = Role::where('name', 'Parent')->first();
        if ($parent) {
            $parent->permissions()->sync($p([
                'structure.view',
                'timetable.view',
                'attendance.view',
                'attendance.justification.submit',
                'assignments.view',
                'assignments.submit',
                'exams.view', // Only if published
                'announcements.view',
                'memos.view',
                'memos.ack',
                'tickets.create',
                'tickets.view'
            ]));
        }

        // Student
        $student = Role::where('name', 'Student')->first();
        if ($student) {
            $student->permissions()->sync($p([
                'timetable.view',
                'attendance.view', // Self view later
                'announcements.view',
                'memos.view',
                'memos.ack',
                'assignments.view',
                'assignments.submit',
                'exams.view'
            ]));
        }

        // Reception
        $reception = Role::where('name', 'Reception')->first();
        if ($reception) {
            $reception->permissions()->sync($p([
                'students.view',
                'students.create',
                'students.update',
                'tickets.view'
            ]));
        }
    }
}
