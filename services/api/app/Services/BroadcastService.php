<?php

namespace App\Services;

use App\Models\Announcement;
use App\Models\Memo;
use App\Models\User;
use Carbon\Carbon;

class BroadcastService
{
    protected $timeline;
    protected $resolver;

    public function __construct(TimelineEmitter $timeline, TargetResolver $resolver)
    {
        $this->timeline = $timeline;
        $this->resolver = $resolver;
    }

    public function createAnnouncement(array $data, User $creator)
    {
        $publishAt = isset($data['publish_at']) ? Carbon::parse($data['publish_at']) : now();
        $shouldPublishNow = $publishAt->lessThanOrEqualTo(now());

        $announcement = Announcement::create([
            'branch_id' => $data['branch_id'] ?? null,
            'title_en' => $data['title_en'],
            'title_ar' => $data['title_ar'] ?? null,
            'body_en' => $data['body_en'],
            'body_ar' => $data['body_ar'] ?? null,
            'scope_json' => $data['scope_json'],
            'publish_at' => $publishAt,
            'published_at' => $shouldPublishNow ? now() : null,
            'created_by_user_id' => $creator->id,
        ]);

        if ($shouldPublishNow) {
            $this->emitEvents($announcement, 'Announcement');
        }

        return $announcement;
    }

    public function createMemo(array $data, User $creator)
    {
        $publishAt = isset($data['publish_at']) ? Carbon::parse($data['publish_at']) : now();
        $shouldPublishNow = $publishAt->lessThanOrEqualTo(now());

        $memo = Memo::create([
            'branch_id' => $data['branch_id'] ?? null,
            'title_en' => $data['title_en'],
            'title_ar' => $data['title_ar'] ?? null,
            'body_en' => $data['body_en'],
            'body_ar' => $data['body_ar'] ?? null,
            'scope_json' => $data['scope_json'],
            'publish_at' => $publishAt,
            'published_at' => $shouldPublishNow ? now() : null,
            'created_by_user_id' => $creator->id,
            'ack_required' => $data['ack_required'] ?? true,
        ]);

        if ($shouldPublishNow) {
            $this->emitEvents($memo, 'Memo');
        }

        return $memo;
    }

    public function publish(string $type, int $id)
    {
        $model = $type === 'Memo' ? Memo::findOrFail($id) : Announcement::findOrFail($id);

        if (!$model->published_at) {
            $model->update(['published_at' => now()]);
            $this->emitEvents($model, $type);
        }
    }

    protected function emitEvents($model, $type)
    {
        $scope = $model->scope_json;
        $title = $type === 'Memo' ? "Memo: {$model->title_en}" : "Announcement: {$model->title_en}";
        $evtType = $type === 'Memo' ? 'MemoPublished' : 'AnnouncementPublished';

        // Decide detailed scope logic
        // If student_ids -> emit for each student
        if (!empty($scope['student_ids'])) {
            foreach ($scope['student_ids'] as $sid) {
                $this->timeline->emitForStudent($sid, 0, 0, $evtType, $title, ['id' => $model->id]);
            }
            return;
        }

        // If section_ids -> emit for each section
        if (!empty($scope['section_ids'])) {
            foreach ($scope['section_ids'] as $sid) {
                $this->timeline->emitForSection($sid, $model->branch_id ?? 0, $evtType, $title, ['id' => $model->id]);
            }
            return;
        }

        // Else Branch
        $branches = $scope['branch_ids'] ?? [];
        if (!empty($branches)) {
            foreach ($branches as $bid) {
                $this->timeline->emitForBranch($bid, $evtType, $title, ['id' => $model->id]);
            }
        }
    }

    public function listAnnouncementsForUser(User $user)
    {
        $query = Announcement::whereNotNull('published_at')->orderByDesc('published_at');
        // 1. Initial Audience Filter (SQL)
        $this->resolver->scopeForUser($query, $user);

        $results = $query->get();

        // 2. PHP Detail Filter (TargetResolver matches)
        return $results->filter(fn($item) => $this->resolver->matches($user, $item->scope_json))->values();
    }

    public function listMemosForUser(User $user)
    {
        $query = Memo::whereNotNull('published_at')->orderByDesc('published_at');
        // 1. SQL Filter
        $this->resolver->scopeForUser($query, $user);

        $memos = $query->get();

        // 2. PHP Filter
        $memos = $memos->filter(fn($item) => $this->resolver->matches($user, $item->scope_json))->values();

        // Attach ack status
        $userAcks = $user->memoAcknowledgements()->pluck('memo_id')->toArray();

        $memos->transform(function ($m) use ($userAcks) {
            $m->is_acknowledged = in_array($m->id, $userAcks);
            return $m;
        });

        return $memos;
    }
}
