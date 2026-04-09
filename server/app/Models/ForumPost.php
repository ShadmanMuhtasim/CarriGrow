<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ForumPost extends Model
{
    use HasFactory;
    use SoftDeletes;

    public const TYPE_QUESTION = 'question';
    public const TYPE_DISCUSSION = 'discussion';
    public const TYPE_RESOURCE = 'resource';

    public const STATUS_PUBLISHED = 'published';
    public const STATUS_HIDDEN = 'hidden';
    public const STATUS_DELETED = 'deleted';

    protected $fillable = [
        'user_id',
        'title',
        'content',
        'type',
        'views_count',
        'replies_count',
        'is_pinned',
        'is_solved',
        'status',
    ];

    protected $casts = [
        'views_count' => 'integer',
        'replies_count' => 'integer',
        'is_pinned' => 'boolean',
        'is_solved' => 'boolean',
        'deleted_at' => 'datetime',
    ];

    protected $appends = [
        'author_name',
        'post_type',
        'skill_ids',
    ];

    public function getAuthorNameAttribute(): ?string
    {
        if ($this->relationLoaded('user')) {
            return $this->user?->name;
        }

        return null;
    }

    public function getPostTypeAttribute(): ?string
    {
        return $this->attributes['type'] ?? null;
    }

    public function getSkillIdsAttribute(): array
    {
        if ($this->relationLoaded('skills')) {
            return $this->skills->pluck('id')->map(fn ($id) => (int) $id)->values()->all();
        }

        return $this->skills()->pluck('skills.id')->map(fn ($id) => (int) $id)->values()->all();
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function replies()
    {
        return $this->hasMany(ForumReply::class, 'post_id');
    }

    public function solutionReply()
    {
        return $this->hasOne(ForumReply::class, 'post_id')->where('is_solution', true);
    }

    public function skills()
    {
        return $this->belongsToMany(Skill::class, 'forum_post_skill', 'post_id', 'skill_id')->withTimestamps();
    }
}
