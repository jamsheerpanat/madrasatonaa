<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // 1. Templates
        Schema::create('notification_templates', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->string('title_en');
            $table->string('title_ar')->nullable();
            $table->text('body_en');
            $table->text('body_ar')->nullable();
            $table->json('channels_json'); // ["EMAIL", "SMS", "PUSH"] default channels
            $table->timestamps();
        });

        // 2. Events
        Schema::create('notification_events', function (Blueprint $table) {
            $table->id();
            $table->string('event_key');
            $table->unsignedBigInteger('branch_id')->nullable();
            $table->unsignedBigInteger('section_id')->nullable();
            $table->unsignedBigInteger('student_id')->nullable();
            $table->unsignedBigInteger('actor_user_id')->nullable();
            $table->json('payload_json')->nullable();
            $table->timestamps();
        });

        // 3. Deliveries
        Schema::create('notification_deliveries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('notification_event_id')->constrained()->cascadeOnDelete();
            $table->foreignId('recipient_user_id')->constrained('users')->cascadeOnDelete();
            $table->enum('channel', ['EMAIL', 'SMS', 'PUSH']);
            $table->string('destination');
            $table->enum('status', ['PENDING', 'SENT', 'FAILED', 'SKIPPED'])->default('PENDING');
            $table->integer('attempt_count')->default(0);
            $table->timestamp('last_attempt_at')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->text('error_message')->nullable();
            $table->string('provider_message_id')->nullable();
            $table->timestamps();

            $table->index(['recipient_user_id', 'status']);
            $table->index(['status', 'created_at']);
        });

        // 4. Device Tokens
        Schema::create('device_tokens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('platform', ['WEB', 'IOS', 'ANDROID']);
            $table->string('token');
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_seen_at')->nullable();
            $table->timestamps();

            $table->unique(['platform', 'token']);
        });

        // 5. School Settings Update (Quiet Hours)
        Schema::table('school_settings', function (Blueprint $table) {
            $table->boolean('quiet_hours_enabled')->default(true);
            $table->string('quiet_hours_start')->default('21:00');
            $table->string('quiet_hours_end')->default('07:00');
        });
    }

    public function down(): void
    {
        Schema::table('school_settings', function (Blueprint $table) {
            $table->dropColumn(['quiet_hours_enabled', 'quiet_hours_start', 'quiet_hours_end']);
        });
        Schema::dropIfExists('device_tokens');
        Schema::dropIfExists('notification_deliveries');
        Schema::dropIfExists('notification_events');
        Schema::dropIfExists('notification_templates');
    }
};
