<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\NotificationTemplate;

class NotificationTemplateSeeder extends Seeder
{
    public function run()
    {
        $templates = [
            [
                'key' => 'memo_published',
                'title_en' => 'New Memo Published',
                'body_en' => 'A new memo {{title}} has been published. Please acknowledge.',
                'channels_json' => ['EMAIL']
            ],
            [
                'key' => 'assignment_posted',
                'title_en' => 'New Assignment Posted',
                'body_en' => 'New assignment {{title}} for {{subject}}. Due: {{due_date}}.',
                'channels_json' => ['EMAIL']
            ],
            [
                'key' => 'ticket_replied',
                'title_en' => 'Update on your Request',
                'body_en' => 'There is a new reply on your ticket {{ticket_code}}.',
                'channels_json' => ['EMAIL']
            ],
            [
                'key' => 'results_published',
                'title_en' => 'Term Results Published',
                'body_en' => 'Results for {{term}} have been published. Please check the portal.',
                'channels_json' => ['EMAIL', 'SMS']
            ]
        ];

        foreach ($templates as $t) {
            NotificationTemplate::updateOrCreate(['key' => $t['key']], $t);
        }
    }
}
