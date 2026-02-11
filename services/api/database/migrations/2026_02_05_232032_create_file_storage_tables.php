<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // 1. Files
        Schema::create('files', function (Blueprint $table) {
            $table->id();
            $table->string('storage_disk')->default('s3');
            $table->string('bucket');
            $table->string('object_key')->unique();
            $table->string('original_name');
            $table->string('mime_type');
            $table->bigInteger('size_bytes');
            $table->string('checksum_sha256')->nullable();

            $table->foreignId('uploaded_by_user_id')->constrained('users');
            $table->enum('visibility', ['PRIVATE', 'PUBLIC'])->default('PRIVATE'); // Public meant for public bucket objects if any

            $table->timestamps();
        });

        // 2. File Links (Polymorphic)
        Schema::create('file_links', function (Blueprint $table) {
            $table->id();
            $table->foreignId('file_id')->constrained()->cascadeOnDelete();

            // Polymorphic relation
            $table->string('entity_type'); // e.g., App\Models\TicketMessage
            $table->unsignedBigInteger('entity_id');

            $table->string('purpose'); // ASSIGNMENT_ATTACHMENT, etc.

            $table->timestamps();

            $table->index(['entity_type', 'entity_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('file_links');
        Schema::dropIfExists('files');
    }
};
