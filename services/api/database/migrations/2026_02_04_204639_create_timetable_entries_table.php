<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('timetable_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained()->onDelete('cascade'); // Denormalized
            $table->foreignId('section_id')->constrained()->onDelete('cascade');
            $table->enum('day_of_week', ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']);
            $table->integer('period_no');
            $table->foreignId('subject_id')->constrained()->onDelete('cascade');
            $table->foreignId('teacher_user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('room_name')->nullable();
            $table->timestamps();

            // Unique constraint: Section cannot have two subjects at same time
            $table->unique(['section_id', 'day_of_week', 'period_no']);

            // Indexes
            $table->index('branch_id');
            $table->index('teacher_user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('timetable_entries');
    }
};
