<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NotificationEngineTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\SchoolSettingSeeder::class);
        $this->seed(\Database\Seeders\NotificationTemplateSeeder::class);
        $this->seed(\Database\Seeders\BranchSeeder::class);
    }

    public function test_engine_creates_event_and_deliveries()
    {
        $user = User::factory()->create(['email' => 'test@example.com']);
        $engine = new \App\Services\NotificationEngine();

        $engine->dispatch('memo_published', ['payload' => ['title' => 'Test']], collect([$user]));

        $this->assertDatabaseHas('notification_events', ['event_key' => 'memo_published']);
        $this->assertDatabaseHas('notification_deliveries', [
            'recipient_user_id' => $user->id,
            'channel' => 'EMAIL',
            'destination' => 'test@example.com'
        ]);
    }

    public function test_quiet_hours_skips_sms()
    {
        // Enable Quiet Hours
        \App\Models\SchoolSetting::first()->update([
            'quiet_hours_enabled' => true,
            'quiet_hours_start' => '00:00',
            'quiet_hours_end' => '23:59' // Always quiet
        ]);

        $user = User::factory()->create(['phone' => '123456789']);
        $engine = new \App\Services\NotificationEngine();

        // Template 'results_published' has SMS
        $engine->dispatch('results_published', ['payload' => ['term' => 'T1']], collect([$user]));

        $this->assertDatabaseHas('notification_deliveries', [
            'recipient_user_id' => $user->id,
            'channel' => 'SMS',
            'status' => 'SKIPPED'
        ]);

        // Email should still be PENDING (not skipped)
        $this->assertDatabaseHas('notification_deliveries', [
            'recipient_user_id' => $user->id,
            'channel' => 'EMAIL',
            'status' => 'PENDING'
        ]);
    }
}
