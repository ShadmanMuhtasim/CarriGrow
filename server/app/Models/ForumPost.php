<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ForumPost extends Model
{
    public const STATUS_ACTIVE = 'active';
    public const STATUS_HIDDEN = 'hidden';
    public const STATUS_DELETED = 'deleted';

    protected $fillable = ['user_id','title','content','status'];

    public function user() { return $this->belongsTo(User::class); }

    public function replies() { return $this->hasMany(ForumReply::class, 'post_id'); }

    public function skills() { return $this->belongsToMany(Skill::class, 'forum_post_skill')->withTimestamps(); }
}