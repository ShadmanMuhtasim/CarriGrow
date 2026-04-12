<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ForumReply extends Model
{
    use HasFactory;

    protected $appends = [
        'author_name',
    ];

    protected $fillable = [
        'post_id',
        'user_id',
        'content',
        'is_solution',
    ];

    protected $casts = [
        'is_solution' => 'boolean',
    ];

    public function getAuthorNameAttribute(): ?string
    {
        if ($this->relationLoaded('user')) {
            return $this->user?->name;
        }

        return null;
    }

    public function post()
    {
        return $this->belongsTo(ForumPost::class, 'post_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
