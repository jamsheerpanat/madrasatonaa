<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('sections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('grade_id')->constrained();
            $table->string('name'); // A, B, C
            $table->integer('capacity')->default(30);
            $table->timestamps();

            // Indexes
            $table->index('grade_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sections');
    }
};
