<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('timeline_events', function (Blueprint $table) {
            $table->id();

            // Scope Relationships
            $table->foreignId('branch_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('section_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('student_id')->nullable()->constrained()->onDelete('cascade');

            // Actor (Nullable for system events)
            $table->foreignId('actor_user_id')->nullable()->constrained('users')->onDelete('set null');

            // Event Details
            $table->string('event_type'); // e.g., AttendanceMarked
            $table->string('title_en');
            $table->string('title_ar')->nullable();
            $table->text('body_en')->nullable();
            $table->text('body_ar')->nullable();

            // Metadata
            $table->json('payload_json')->nullable();

            // Visibility
            $table->enum('visibility_scope', [
                'BRANCH',
                'SECTION',
                'STUDENT',
                'STAFF_ONLY',
                'PARENTS_ONLY',
                'STUDENTS_ONLY',
                'CUSTOM'
            ]);

            $table->json('audience_roles_json')->nullable(); // For CUSTOM scope

            $table->timestamps();

            // Indexes for performance
            $table->index(['branch_id', 'created_at']);
            $table->index(['section_id', 'created_at']);
            $table->index(['student_id', 'created_at']);
            $table->index('event_type');
            $table->index('created_at'); // Cursor pagination
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('timeline_events');
    }
};
