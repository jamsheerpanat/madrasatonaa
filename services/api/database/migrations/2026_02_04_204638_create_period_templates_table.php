<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('period_templates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained()->onDelete('cascade');
            $table->string('name')->default('Default');
            $table->integer('periods_per_day')->default(8);
            $table->json('period_times_json')->nullable(); // Array of {period_no, start, end}
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            // Constraint: Ideally only one active per branch, but enforcing via code is easier for now or partial unique index
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('period_templates');
    }
};
