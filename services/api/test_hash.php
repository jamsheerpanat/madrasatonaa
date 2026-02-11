<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$email = 'jamsheerpanat@gmail.com';
$password = 'password';

$user = User::where('email', $email)->first();

if (!$user) {
    echo "User not found\n";
    exit;
}

echo "Testing password for $email...\n";
if (Hash::check($password, $user->password)) {
    echo "Password check PASSED\n";
} else {
    echo "Password check FAILED\n";
    echo "Stored hash: " . $user->password . "\n";

    // Let's try to set it EXPLICITLY with Hash::make to be absolutely sure
    echo "Re-setting password with explicit Hash::make('password')...\n";
    // We bypass the cast by setting the attribute directly if needed, 
    // but actually let's just see if Hash::make works.
    $user->password = Hash::make($password);
    $user->save();

    if (Hash::check($password, $user->password)) {
        echo "Second check PASSED after explicit Hash::make\n";
    } else {
        echo "Second check FAILED - something is very wrong with hashing/casting\n";
    }
}
