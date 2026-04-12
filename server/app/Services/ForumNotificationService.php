<?php

namespace App\Services;

use App\Models\ForumPost;
use App\Models\ForumReply;
use App\Models\User;
use App\Models\UserNotification;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class ForumNotificationService
{
    public function notifyPostCreated(ForumPost $post, ?User $actor = null): void
    {
        $post->loadMissing([
            'skills:id,name,category',
        ]);

        $actor = $actor ?? $post->user;

        $this->notifyMentionsForPost($post, $actor);
        $this->notifyNewQuestionInExpertise($post, $actor);
    }

    public function notifyReplyCreated(ForumReply $reply, ?User $actor = null): void
    {
        $reply->load([
            'user:id,name,email,status,role',
            'post.user:id,name,email,status,role',
        ]);

        $actor = $actor ?? $reply->user;
        $post = $reply->post;

        if ($post && $post->user) {
            $this->createNotification(
                $post->user,
                UserNotification::TYPE_NEW_REPLY_TO_POST,
                $actor,
                [
                    'title' => 'New reply to your post',
                    'message' => sprintf(
                        '%s replied to your post "%s".',
                        $this->actorDisplayName($actor),
                        $this->limitTitle($post->title)
                    ),
                    'post' => $post,
                    'reply' => $reply,
                    'data' => [
                        'context' => 'reply',
                        'post_title' => $post->title,
                        'reply_excerpt' => $this->excerpt($reply->content),
                    ],
                ]
            );
        }

        $this->notifyMentionsForReply($reply, $actor);
    }

    public function notifyReplyMarkedAsSolution(ForumReply $reply, ?User $actor = null): void
    {
        $reply->load([
            'user:id,name,email,status,role',
            'post.user:id,name,email,status,role',
        ]);

        $actor = $actor ?? $reply->post?->user;
        $post = $reply->post;

        if (!$post || !$reply->user) {
            return;
        }

        $this->createNotification(
            $reply->user,
            UserNotification::TYPE_ANSWER_MARKED_AS_SOLUTION,
            $actor,
            [
                'title' => 'Your answer was marked as solution',
                'message' => sprintf(
                    '%s marked your reply as the solution for "%s".',
                    $this->actorDisplayName($actor),
                    $this->limitTitle($post->title)
                ),
                'post' => $post,
                'reply' => $reply,
                'data' => [
                    'context' => 'solution_marked',
                    'post_title' => $post->title,
                    'reply_excerpt' => $this->excerpt($reply->content),
                ],
            ]
        );
    }

    private function notifyMentionsForPost(ForumPost $post, ?User $actor): void
    {
        $mentionedUsers = $this->resolveMentionedUsers([$post->title, $post->content], $actor?->id);

        foreach ($mentionedUsers as $recipient) {
            $this->createNotification(
                $recipient,
                UserNotification::TYPE_MENTION,
                $actor,
                [
                    'title' => 'You were mentioned in a forum post',
                    'message' => sprintf(
                        '%s mentioned you in the post "%s".',
                        $this->actorDisplayName($actor),
                        $this->limitTitle($post->title)
                    ),
                    'post' => $post,
                    'reply' => null,
                    'data' => [
                        'context' => 'post',
                        'post_title' => $post->title,
                    ],
                ]
            );
        }
    }

    private function notifyMentionsForReply(ForumReply $reply, ?User $actor): void
    {
        $post = $reply->post;
        if (!$post) {
            return;
        }

        $mentionedUsers = $this->resolveMentionedUsers([$reply->content], $actor?->id);

        foreach ($mentionedUsers as $recipient) {
            $this->createNotification(
                $recipient,
                UserNotification::TYPE_MENTION,
                $actor,
                [
                    'title' => 'You were mentioned in a forum reply',
                    'message' => sprintf(
                        '%s mentioned you in a reply on "%s".',
                        $this->actorDisplayName($actor),
                        $this->limitTitle($post->title)
                    ),
                    'post' => $post,
                    'reply' => $reply,
                    'data' => [
                        'context' => 'reply',
                        'post_title' => $post->title,
                        'reply_excerpt' => $this->excerpt($reply->content),
                    ],
                ]
            );
        }
    }

    private function notifyNewQuestionInExpertise(ForumPost $post, ?User $actor): void
    {
        if ($post->type !== ForumPost::TYPE_QUESTION) {
            return;
        }

        $skillIds = $post->skills
            ->pluck('id')
            ->map(fn ($id) => (int) $id)
            ->filter(fn ($id) => $id > 0)
            ->unique()
            ->values()
            ->all();

        if ($skillIds === []) {
            return;
        }

        $skillNames = $post->skills
            ->pluck('name')
            ->filter(fn ($name) => is_string($name) && trim($name) !== '')
            ->take(3)
            ->values()
            ->all();

        $expertiseSummary = $skillNames === [] ? 'your expertise' : implode(', ', $skillNames);

        $recipients = User::query()
            ->where('role', User::ROLE_MENTOR)
            ->where('status', User::STATUS_ACTIVE)
            ->when($actor?->id, function ($query, $actorId) {
                $query->where('id', '!=', $actorId);
            })
            ->whereHas('skills', function ($query) use ($skillIds) {
                $query->whereIn('skills.id', $skillIds);
            })
            ->get(['id', 'name', 'email', 'status']);

        foreach ($recipients as $recipient) {
            $this->createNotification(
                $recipient,
                UserNotification::TYPE_NEW_QUESTION_IN_EXPERTISE,
                $actor,
                [
                    'title' => 'New question in your expertise',
                    'message' => sprintf(
                        '%s asked a new question tagged with %s.',
                        $this->actorDisplayName($actor),
                        $expertiseSummary
                    ),
                    'post' => $post,
                    'reply' => null,
                    'data' => [
                        'context' => 'expertise_question',
                        'post_title' => $post->title,
                        'skill_ids' => $skillIds,
                        'skill_names' => $skillNames,
                    ],
                ]
            );
        }
    }

    private function resolveMentionedUsers(array $segments, ?int $excludeUserId = null): Collection
    {
        $tokens = $this->extractMentionTokens($segments);

        if ($tokens === []) {
            return collect();
        }

        $tokenLookup = array_fill_keys($tokens, true);

        return User::query()
            ->where('status', User::STATUS_ACTIVE)
            ->when($excludeUserId !== null, function ($query) use ($excludeUserId) {
                $query->where('id', '!=', $excludeUserId);
            })
            ->get(['id', 'name', 'email', 'status'])
            ->filter(function (User $user) use ($tokenLookup) {
                foreach ($this->mentionAliasesForUser($user) as $alias) {
                    if (isset($tokenLookup[$alias])) {
                        return true;
                    }
                }

                return false;
            })
            ->values();
    }

    private function extractMentionTokens(array $segments): array
    {
        $text = collect($segments)
            ->filter(fn ($segment) => is_string($segment) && trim($segment) !== '')
            ->map(fn ($segment) => strip_tags($segment))
            ->implode(' ');

        if ($text === '') {
            return [];
        }

        preg_match_all('/(^|[^\w])@([A-Za-z0-9._-]{2,50})/u', $text, $matches);

        return collect($matches[2] ?? [])
            ->map(fn ($token) => strtolower((string) $token))
            ->unique()
            ->values()
            ->all();
    }

    private function mentionAliasesForUser(User $user): array
    {
        $name = strtolower(trim((string) $user->name));
        $emailLocal = strtolower((string) Str::before((string) $user->email, '@'));
        $slug = trim((string) preg_replace('/[^a-z0-9]+/', '-', $name), '-');
        $collapsed = (string) preg_replace('/[^a-z0-9]+/', '', $name);

        return array_values(array_unique(array_filter([
            $emailLocal,
            $collapsed,
            $slug,
            str_replace('-', '_', $slug),
            str_replace('-', '.', $slug),
        ], fn ($alias) => $alias !== '')));
    }

    private function createNotification(User $recipient, string $type, ?User $actor, array $payload): void
    {
        if ($recipient->status !== User::STATUS_ACTIVE) {
            return;
        }

        if ($actor && $recipient->id === $actor->id) {
            return;
        }

        UserNotification::query()->create([
            'user_id' => $recipient->id,
            'actor_id' => $actor?->id,
            'type' => $type,
            'title' => $payload['title'],
            'message' => $payload['message'],
            'data' => $payload['data'] ?? null,
            'post_id' => $payload['post']?->id,
            'reply_id' => $payload['reply']?->id,
        ]);
    }

    private function actorDisplayName(?User $actor): string
    {
        $name = trim((string) ($actor?->name ?? 'A community member'));

        return $name !== '' ? $name : 'A community member';
    }

    private function limitTitle(string $title): string
    {
        return Str::limit(trim($title), 80);
    }

    private function excerpt(string $content): ?string
    {
        $plainText = trim(preg_replace('/\s+/', ' ', strip_tags($content)) ?? '');

        return $plainText === '' ? null : Str::limit($plainText, 120);
    }
}
