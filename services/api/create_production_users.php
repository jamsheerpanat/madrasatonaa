<?php

use App\Models\User;
use App\Models\Role;
use App\Models\Branch;
use App\Models\Student;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Starting User Creation/Update...\n";

// 1. Create Principal User (jamsheerpanat@gmail.com)
// Note: User model has 'hashed' cast, so we pass plain text password.
$principal = User::updateOrCreate(
    ['email' => 'jamsheerpanat@gmail.com'],
    [
        'full_name' => 'Jamsheer Panat',
        'password' => 'password',
        'user_type' => 'STAFF',
        'is_active' => true,
    ]
);

$principalRole = Role::where('name', 'Principal')->first();
$branch = Branch::first();

if ($principalRole && $branch) {
    if (!$principal->roles->contains($principalRole->id)) {
        $principal->roles()->attach($principalRole->id, ['branch_id' => $branch->id]);
    }
    echo "Principal user updated: jamsheerpanat@gmail.com\n";
}

// 2. Create Parent User (jamsheer@gmail.com)
$parent = User::updateOrCreate(
    ['email' => 'jamsheer@gmail.com'],
    [
        'full_name' => 'Jamsheer Parent',
        'password' => 'password',
        'phone' => '1234567890',
        'user_type' => 'PARENT',
        'is_active' => true,
    ]
);
echo "Parent user updated: jamsheer@gmail.com\n";

// 3. Create Student User (Ezzah Mehak)
$studentUser = User::updateOrCreate(
    ['email' => 'ezzah@gmail.com'],
    [
        'full_name' => 'Ezzah Mehak',
        'password' => 'password',
        'user_type' => 'STUDENT',
        'is_active' => true,
    ]
);

$student = Student::updateOrCreate(
    ['user_id' => $studentUser->id],
    [
        'admission_number' => 'ADM-2026-001',
        'first_name_en' => 'Ezzah',
        'last_name_en' => 'Mehak',
        'gender' => 'FEMALE',
    ]
);
echo "Student updated: Ezzah Mehak\n";

// 4. Link Parent
$exists = DB::table('student_guardians')
    ->where('student_id', $student->id)
    ->where('guardian_user_id', $parent->id)
    ->exists();

if (!$exists) {
    DB::table('student_guardians')->insert([
        'student_id' => $student->id,
        'guardian_user_id' => $parent->id,
        'relationship' => 'FATHER',
        'is_primary' => 1,
        'created_at' => now(),
        'updated_at' => now(),
    ]);
    echo "Linked Parent to Student\n";
}

echo "DONE!\n";
