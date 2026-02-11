<?php

namespace App\Services;

use App\Models\NotificationTemplate;
use App\Models\NotificationEvent;
use App\Models\NotificationDelivery;
use App\Models\User;
use App\Models\SchoolSetting;
use Illuminate\Support\Facades\Log;

class NotificationEngine
{
    public function dispatch(string $eventKey, array $context, $recipients)
    {
        // 1. Create Event Record
        $event = NotificationEvent::create([
            'event_key' => $eventKey,
            'branch_id' => $context['branch_id'] ?? null,
            'section_id' => $context['section_id'] ?? null,
            'student_id' => $context['student_id'] ?? null,
            'actor_user_id' => $context['actor_user_id'] ?? null,
            'payload_json' => $context['payload'] ?? []
        ]);

        // 2. Load Template
        $template = NotificationTemplate::where('key', $eventKey)->first();
        if (!$template) {
            Log::warning("No template for event: $eventKey");
            return;
        }

        // 3. Resolve School Settings (Quiet Hours)
        $settings = SchoolSetting::first();
        $isQuiet = false;

        if ($settings && $settings->quiet_hours_enabled) {
            $now = date('H:i');
            $start = $settings->quiet_hours_start;
            $end = $settings->quiet_hours_end;

            // Simple check handling 21:00 to 07:00 (cross midnight)
            if ($start > $end) {
                // e.g. 21:00 to 07:00
                if ($now >= $start || $now < $end)
                    $isQuiet = true;
            } else {
                // e.g. 09:00 to 17:00 (unlikely for quiet hours but possible)
                if ($now >= $start && $now < $end)
                    $isQuiet = true;
            }
        }

        // 4. Process Recipients
        // $recipients could be Collection<User> or array of IDs or Query Builder.
        // Assuming Collection<User> for now.

        foreach ($recipients as $user) {
            foreach ($template->channels_json as $channel) {

                $status = 'PENDING';
                $destination = $this->resolveDestination($user, $channel);

                if (!$destination) {
                    // Log::info("No destination for user {$user->id} channel {$channel}");
                    continue;
                }

                // Apply Quiet Hours
                if ($isQuiet && in_array($channel, ['SMS', 'PUSH'])) {
                    $status = 'SKIPPED'; // MVP: Just skip. Phase 5: Schedule.
                }

                NotificationDelivery::create([
                    'notification_event_id' => $event->id,
                    'recipient_user_id' => $user->id,
                    'channel' => $channel,
                    'destination' => $destination,
                    'status' => $status
                ]);
            }
        }

        // 5. Trigger Queue Job (Batch)
        // Check if there are PENDING deliveries for this event.
        // If so, dispatch Job.
        // dispatch(new ProcessNotificationEvent($event->id));
        // Use sync for MVP or dispatch job stub.
    }

    protected function resolveDestination(User $user, string $channel)
    {
        switch ($channel) {
            case 'EMAIL':
                return $user->email;
            case 'SMS':
                return $user->phone; // Corrected column name
            case 'PUSH':
                // Get ANY active token? Or loop?
                // Delivery usually 1:1. If multiple devices, multiple PUSH deliveries? 
                // For MVP, simplistic: one destination string. 
                // Actually PUSH provider often takes User ID and handles tokens.
                // let's put 'user_id' as destination or 'all_devices'. 
                return 'all_devices';
        }
        return null;
    }
}
