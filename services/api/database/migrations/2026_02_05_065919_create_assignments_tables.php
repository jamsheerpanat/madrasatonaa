<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained()->cascadeOnDelete();
            $table->foreignId('section_id')->constrained()->cascadeOnDelete();
            // Assuming subjects table exists, if not we might need to be careful or mock it.
            // The prompt asks for foreign key to subjects.id. 
            // I'll check if subjects table exists, if not I will defer the FK constraint or assume it exists.
            // Based on previous context, subjects might not be implemented yet or standard. 
            // I will implement `unsignedBigInteger` without constraint if I'm unsure, but the prompt says "FK subjects.id".
            // Let's assume subjects table exists or will exist. 
            // Wait, looking at file list, I don't see subjects table created yet in this session logs.
            // However, usually it's there. I'll use standard foreignId but if it fails I'll fix.
            // Actually, checking previous conversations, I haven't seen subjects migration. 
            // Safe bet: create table or mock? No, I should stick to requirements.
            // "subject_id (FK subjects.id)"
            // I'll assume `subjects` table might be created or I should creat it? 
            // Prompt says "FK subjects.id". 
            // Use foreignId('subject_id') but maybe without 'constrained()' if unsure of table name 'subjects'.
            // Actually, let's look at recent file list... no subjects.
            // I'll use `unsignedBigInteger('subject_id')` and index it, but not strictly constrain valid table yet if table missing.
            $table->unsignedBigInteger('subject_id')->index();

            $table->foreignId('created_by_user_id')->constrained('users');

            $table->enum('assignment_type', ['HOMEWORK', 'CLASSWORK', 'PROJECT', 'QUIZ']);
            $table->string('title_en');
            $table->string('title_ar')->nullable();
            $table->text('instructions_en');
            $table->text('instructions_ar')->nullable();
            $table->dateTime('due_at')->nullable();
            $table->integer('max_grade')->nullable();

            $table->enum('status', ['DRAFT', 'PUBLISHED'])->default('PUBLISHED');
            $table->dateTime('published_at')->nullable();

            $table->timestamps();
        });

        Schema::create('assignment_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('assignment_id')->constrained()->cascadeOnDelete();
            $table->string('file_url');
            $table->string('file_name')->nullable();
            $table->string('mime_type')->nullable();
            $table->timestamps();
        });

        Schema::create('submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('assignment_id')->constrained()->cascadeOnDelete();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();

            $table->foreignId('submitted_by_user_id')->nullable()->constrained('users');
            $table->foreignId('submitted_by_guardian_id')->nullable()->constrained('guardians'); // Assuming guardians table

            $table->text('submission_text')->nullable();
            $table->dateTime('submitted_at');

            $table->enum('status', ['SUBMITTED', 'GRADED', 'RETURNED'])->default('SUBMITTED');

            $table->integer('grade_value')->nullable();
            $table->string('grade_letter')->nullable();
            $table->text('feedback')->nullable();

            $table->foreignId('graded_by_user_id')->nullable()->constrained('users');
            $table->dateTime('graded_at')->nullable();

            $table->timestamps();

            $table->unique(['assignment_id', 'student_id']);
        });

        Schema::create('submission_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('submission_id')->constrained()->cascadeOnDelete();
            $table->string('file_url');
            $table->string('file_name')->nullable();
            $table->string('mime_type')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('submission_attachments');
        Schema::dropIfExists('submissions');
        Schema::dropIfExists('assignment_attachments');
        Schema::dropIfExists('assignments');
    }
};
