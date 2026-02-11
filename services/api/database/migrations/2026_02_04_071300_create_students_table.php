<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->string('admission_number')->unique();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('first_name_en');
            $table->string('first_name_ar')->nullable();
            $table->string('last_name_en');
            $table->string('last_name_ar')->nullable();
            $table->date('dob');
            $table->enum('gender', ['M', 'F']);
            $table->enum('status', ['ACTIVE', 'INACTIVE', 'ALUMNI'])->default('ACTIVE');
            $table->date('enrollment_date');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
