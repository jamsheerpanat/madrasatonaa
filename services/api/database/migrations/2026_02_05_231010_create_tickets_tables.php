<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        // 1. Ticket Categories
        Schema::create('ticket_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name_en');
            $table->string('name_ar')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Seed default categories
        DB::table('ticket_categories')->insert([
            ['name_en' => 'Meeting Request', 'created_at' => now(), 'updated_at' => now()],
            ['name_en' => 'Pickup Change', 'created_at' => now(), 'updated_at' => now()],
            ['name_en' => 'Student Concern', 'created_at' => now(), 'updated_at' => now()],
            ['name_en' => 'Document Request', 'created_at' => now(), 'updated_at' => now()],
            ['name_en' => 'General Inquiry', 'created_at' => now(), 'updated_at' => now()],
        ]);

        // 2. Tickets
        Schema::create('tickets', function (Blueprint $table) {
            $table->id();
            $table->string('ticket_code')->unique(); // TKT-YYYY-XXXX
            $table->foreignId('category_id')->constrained('ticket_categories');
            $table->foreignId('branch_id')->constrained()->cascadeOnDelete();
            $table->foreignId('student_id')->nullable()->constrained()->onDelete('set null');

            $table->foreignId('created_by_user_id')->constrained('users');
            $table->foreignId('assigned_to_user_id')->nullable()->constrained('users');

            $table->enum('status', ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'])->default('OPEN');
            $table->string('subject');
            $table->enum('priority', ['LOW', 'MEDIUM', 'HIGH'])->default('MEDIUM');

            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
        });

        // 3. Ticket Messages
        Schema::create('ticket_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ticket_id')->constrained()->cascadeOnDelete();
            $table->foreignId('sender_user_id')->constrained('users'); // Parent or Staff
            $table->text('message_text');
            $table->string('attachment_url')->nullable();
            $table->timestamps();
        });

        // 4. Status History
        Schema::create('ticket_status_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ticket_id')->constrained()->cascadeOnDelete();
            $table->string('old_status');
            $table->string('new_status');
            $table->foreignId('changed_by_user_id')->constrained('users');
            $table->timestamp('created_at'); // No updated_at needed for logs
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ticket_status_history');
        Schema::dropIfExists('ticket_messages');
        Schema::dropIfExists('tickets');
        Schema::dropIfExists('ticket_categories');
    }
};
