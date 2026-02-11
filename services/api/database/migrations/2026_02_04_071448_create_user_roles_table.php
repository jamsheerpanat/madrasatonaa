<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('user_roles', function (Blueprint $table) {
            $table->id(); // Surrogate PK to avoid nullable PK issue
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('role_id')->constrained()->cascadeOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained()->onDelete('set null');

            // Unique constraint to prevent duplicate roles (though MySQL allows multiple NULLs in unique)
            // Application logic should handle stricter uniqueness for global roles if needed.
            $table->unique(['user_id', 'role_id', 'branch_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_roles');
    }
};
