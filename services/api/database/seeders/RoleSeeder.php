<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            'Principal',
            'VicePrincipal',
            'HOD',
            'Teacher',
            'Substitute',
            'Accountant',
            'Reception',
            'TransportAdmin',
            'Counselor',
            'Student',
            'Parent',
            'OfficeAdmin',
        ];

        foreach ($roles as $role) {
            Role::firstOrCreate(['name' => $role]);
        }
    }
}
