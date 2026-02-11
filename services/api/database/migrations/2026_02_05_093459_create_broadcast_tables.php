<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('announcements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('title_en');
            $table->string('title_ar')->nullable();
            $table->text('body_en');
            $table->text('body_ar')->nullable();
            $table->json('scope_json');
            $table->dateTime('publish_at');
            $table->dateTime('published_at')->nullable();
            $table->foreignId('created_by_user_id')->constrained('users');
            $table->timestamps();
        });

        Schema::create('memos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('title_en');
            $table->string('title_ar')->nullable();
            $table->text('body_en');
            $table->text('body_ar')->nullable();
            $table->json('scope_json');
            $table->dateTime('publish_at');
            $table->dateTime('published_at')->nullable();
            $table->foreignId('created_by_user_id')->constrained('users');
            $table->boolean('ack_required')->default(true);
            $table->timestamps();
        });

        Schema::create('memo_acknowledgements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('memo_id')->constrained('memos')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->dateTime('acknowledged_at');
            $table->timestamps();

            $table->unique(['memo_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('memo_acknowledgements');
        Schema::dropIfExists('memos');
        Schema::dropIfExists('announcements');
    }
};
