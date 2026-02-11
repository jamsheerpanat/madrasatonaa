<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Role;
use App\Models\Branch;
use App\Models\StaffProfile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class ProductionSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Run Essential Seeders (No demo data)
        $this->call([
            SchoolSettingSeeder::class,
            BranchSeeder::class,
            AcademicYearSeeder::class,
            GradeSeeder::class,
            SectionSeeder::class,
            SubjectSeeder::class,
            RoleSeeder::class,
            PermissionSeeder::class,
        ]);

        // 2. Create Principal User
        $branch = Branch::first();
        if (!$branch) {
            $this->command->error("Branch not found. Run BranchSeeder first.");
            return;
        }

        $principalRole = Role::where('name', 'Principal')->first();
        if (!$principalRole) {
            $this->command->error("Principal Role not found.");
            return;
        }

        $email = 'jamsheerpanat@gmail.com';

        $user = User::updateOrCreate(
            ['email' => $email],
            [
                'full_name' => 'Jamsheer Panat',
                'password' => 'password', // Will be hashed by model cast
                'user_type' => 'STAFF',
                'is_active' => true,
            ]
        );

        // Assign Role
        if (!$user->roles()->where('role_id', $principalRole->id)->exists()) {
            $user->roles()->attach($principalRole->id, ['branch_id' => $branch->id]);
        }

        // Create Profile
        StaffProfile::updateOrCreate(
            ['user_id' => $user->id],
            [
                'branch_id' => $branch->id,
                'job_title' => 'Principal',
                'employee_code' => 'EMP-001',
            ]
        );

        $this->command->info("Production Seeder Complete. Principal user created: $email");
    }
}
