<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class UserNotification extends Model
{
    use HasFactory;

    public const TYPE_NEW_REPLY_TO_POST = 'forum_new_reply_to_post';
    public const TYPE_ANSWER_MARKED_AS_SOLUTION = 'forum_solution_marked';
    public const TYPE_NEW_QUESTION_IN_EXPERTISE = 'forum_question_in_expertise';
    public const TYPE_MENTION = 'forum_mention';

    protected $table = 'notifications';

    protected $fillable = [
        'user_id',
        'actor_id',
        'type',
        'title',
        'message',
        'data',
        'post_id',
        'reply_id',
        'read_at',
    ];

    protected $casts = [
        'data' => 'array',
        'read_at' => 'datetime',
    ];

    protected $appends = [
        'is_read',
        'actor_name',
        'post_title',
        'reply_excerpt',
    ];

    public function getIsReadAttribute(): bool
    {
        return $this->read_at !== null;
    }

    public function getActorNameAttribute(): ?string
    {
        if ($this->relationLoaded('actor')) {
            return $this->actor?->name;
        }

        return null;
    }

    public function getPostTitleAttribute(): ?string
    {
        if ($this->relationLoaded('post')) {
            return $this->post?->title;
        }

        return null;
    }

    public function getReplyExcerptAttribute(): ?string
    {
        if (!$this->relationLoaded('reply') || !$this->reply) {
            return null;
        }

        $content = trim(preg_replace('/\s+/', ' ', strip_tags((string) $this->reply->content)) ?? '');

        return $content === '' ? null : Str::limit($content, 120);
    }

    public function recipient()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function actor()
    {
        return $this->belongsTo(User::class, 'actor_id');
    }

    public function post()
    {
        return $this->belongsTo(ForumPost::class, 'post_id');
    }

    public function reply()
    {
        return $this->belongsTo(ForumReply::class, 'reply_id');
    }
}
