<?php

namespace App\Console\Commands;

use App\Services\BroadcastService;
use App\Models\Announcement;
use App\Models\Memo;
use Illuminate\Console\Command;

class PublishScheduledBroadcasts extends Command
{
    protected $signature = 'broadcasts:publish';
    protected $description = 'Publish scheduled announcements and memos';

    public function handle(BroadcastService $service)
    {
        // 1. Announcements
        $announcements = Announcement::whereNull('published_at')
            ->where('publish_at', '<=', now())
            ->get();

        foreach ($announcements as $a) {
            $service->publish('Announcement', $a->id);
            $this->info("Published Announcement ID: {$a->id}");
        }

        // 2. Memos
        $memos = Memo::whereNull('published_at')
            ->where('publish_at', '<=', now())
            ->get();

        foreach ($memos as $m) {
            $service->publish('Memo', $m->id);
            $this->info("Published Memo ID: {$m->id}");
        }

        $this->info('Done.');
    }
}
