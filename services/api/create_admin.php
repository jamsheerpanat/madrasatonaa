<?php

use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$emails = ['jamsheerpanat@gmail.com', 'jamsheer@gmail.com'];
$password = 'password';

foreach ($emails as $email) {
    $user = User::where('email', $email)->first();

    if (!$user) {
        echo "Creating user $email...\n";
        $user = User::create([
            'full_name' => 'Jamsheer Panat',
            'email' => $email,
            'password' => $password,
            'user_type' => 'STAFF',
            'is_active' => true,
        ]);
    } else {
        echo "User $email already exists. Updating password and type...\n";
        $user->update([
            'password' => $password,
            'user_type' => 'STAFF'
        ]);
    }

    // Ensure they have the Principal role
    $roleName = 'Principal';
    $adminRole = Role::where('name', $roleName)->first();
    if ($adminRole) {
        if (!$user->roles()->where('role_id', $adminRole->id)->exists()) {
            echo "Attaching $roleName role to $email...\n";
            $user->roles()->attach($adminRole->id, ['branch_id' => 1]);
        }
    }
}

echo "Done! You can now login with $email / $password\n";
