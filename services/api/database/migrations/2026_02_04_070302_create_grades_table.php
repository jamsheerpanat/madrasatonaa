<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('grades', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained();
            $table->string('name'); // e.g., Grade 1, KG2
            $table->enum('level_type', ['KG', 'Primary', 'Middle', 'High']);
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            // Indexes
            $table->index('branch_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('grades');
    }
};
