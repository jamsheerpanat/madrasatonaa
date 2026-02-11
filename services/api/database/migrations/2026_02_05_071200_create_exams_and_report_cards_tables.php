<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // 1. Terms
        Schema::create('terms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('academic_year_id')->constrained()->cascadeOnDelete();
            $table->string('name'); // Term 1
            $table->date('start_date');
            $table->date('end_date');
            $table->integer('sort_order')->default(1);
            $table->timestamps();

            $table->unique(['academic_year_id', 'name']);
        });

        // 2. Term Publications
        Schema::create('term_publications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('term_id')->constrained()->cascadeOnDelete();
            $table->dateTime('publish_at');
            $table->dateTime('published_at')->nullable();
            $table->foreignId('created_by_user_id')->constrained('users');
            $table->timestamps();

            $table->unique('term_id');
        });

        // 3. Exams
        Schema::create('exams', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained()->cascadeOnDelete();
            $table->foreignId('section_id')->constrained()->cascadeOnDelete();
            // Assuming subjects table or minimal logic
            $table->unsignedBigInteger('subject_id')->index();
            $table->foreignId('term_id')->constrained()->cascadeOnDelete();

            $table->enum('exam_type', ['UNIT', 'MIDTERM', 'FINAL']);
            $table->date('exam_date');
            $table->integer('max_grade')->nullable();

            $table->foreignId('created_by_user_id')->constrained('users');
            $table->timestamps();
        });

        // 4. Exam Marks
        Schema::create('exam_marks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_id')->constrained()->cascadeOnDelete();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();

            $table->string('grade_letter'); // A, B, C...
            $table->text('remarks')->nullable();
            $table->json('skill_ratings_json')->nullable();

            $table->foreignId('updated_by_user_id')->nullable()->constrained('users');
            $table->dateTime('updated_at_custom')->nullable(); // Since timestamps() handles updated_at, we might verify naming. 
            // The request asks for `updated_by_user_id` and standard `timestamps`.
            // Eloquent maintains created_at/updated_at. 
            // We use standard timestamps() for that.

            $table->timestamps();

            $table->unique(['exam_id', 'student_id']);
        });

        // 5. Report Cards
        Schema::create('report_cards', function (Blueprint $table) {
            $table->id();
            $table->foreignId('term_id')->constrained()->cascadeOnDelete();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();

            $table->dateTime('generated_at');
            $table->foreignId('generated_by_user_id')->nullable()->constrained('users');

            $table->longText('html_snapshot')->nullable();
            $table->string('pdf_url')->nullable();

            $table->timestamps();

            $table->unique(['term_id', 'student_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('report_cards');
        Schema::dropIfExists('exam_marks');
        Schema::dropIfExists('exams');
        Schema::dropIfExists('term_publications');
        Schema::dropIfExists('terms');
    }
};
