<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class WipeDataSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('Wiping all data except principal user...');

        // 1. Identify principal
        $principalEmail = 'principal@madrasatonaa.com';
        $principal = \App\Models\User::where('email', $principalEmail)->first();

        if (!$principal) {
            $this->command->error("Principal user ($principalEmail) not found!");
            return;
        }

        $principalId = $principal->id;

        // Tables to Truncate completely
        $tablesToTruncate = [
            'attendance_justifications',
            'attendance_records',
            'attendance_days',
            'submission_attachments',
            'submissions',
            'assignment_attachments',
            'assignments',
            'exam_marks',
            'report_cards',
            'exams',
            'ticket_status_history',
            'ticket_messages',
            'tickets',
            'memo_acknowledgements',
            'memos',
            'announcements',
            'timeline_events',
            'notification_events',
            'auth_sessions',
            'otp_challenges',
            'timetable_entries',
            'file_links',
            'files',
            'enrollments',
            'student_guardians',
        ];

        Schema::disableForeignKeyConstraints();

        foreach ($tablesToTruncate as $table) {
            if (Schema::hasTable($table)) {
                DB::table($table)->truncate();
                $this->command->info("Truncated $table");
            }
        }

        // Clear class teacher assignments as those users are gone
        DB::table('sections')->update(['class_teacher_id' => null]);
        $this->command->info("Cleared class teacher assignments in sections");

        // Selective cleanup

        // Guardians
        DB::table('guardians')->truncate();
        $this->command->info("Truncated guardians");

        // Students
        DB::table('students')->truncate();
        $this->command->info("Truncated students");

        // Staff Profiles (Keep principal's)
        DB::table('staff_profiles')->where('user_id', '!=', $principalId)->delete();
        $this->command->info("Cleared non-principal staff profiles");

        // User Roles (Keep principal's)
        DB::table('user_roles')->where('user_id', '!=', $principalId)->delete();
        $this->command->info("Cleared non-principal user roles");

        // Personal Access Tokens (Keep principal's)
        DB::table('personal_access_tokens')->where('tokenable_id', '!=', $principalId)->delete();
        $this->command->info("Cleared non-principal tokens");

        // Users (Keep principal's)
        DB::table('users')->where('id', '!=', $principalId)->delete();
        $this->command->info("Cleared all other users");

        Schema::enableForeignKeyConstraints();

        $this->command->info('Data wipe complete. Only principal user remains.');
    }
}
