<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('subjects', function (Blueprint $table) {
            $table->string('name')->nullable()->change();
            $table->string('name_en')->nullable()->after('name');
            $table->string('name_ar')->nullable()->after('name_en');
            $table->enum('type', ['MANDATORY', 'ELECTIVE', 'EXTRA_CURRICULAR'])->default('MANDATORY')->after('name_ar');
            $table->integer('credits')->default(0)->after('type');
            $table->integer('passing_marks')->default(0)->after('credits');
            $table->integer('max_marks')->default(100)->after('passing_marks');
            $table->text('description')->nullable()->after('max_marks');
        });
    }

    public function down(): void
    {
        Schema::table('subjects', function (Blueprint $table) {
            $table->string('name')->nullable(false)->change();
            $table->dropColumn(['name_en', 'name_ar', 'type', 'credits', 'passing_marks', 'max_marks', 'description']);
        });
    }
};
