<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Skill extends Model
{
    protected $fillable = ['name', 'category'];

    public function users()
    {
        return $this->belongsToMany(User::class)->withPivot('proficiency_level')->withTimestamps();
    }

    public function jobs()
    {
        return $this->belongsToMany(Job::class, 'job_skill')->withPivot('importance')->withTimestamps();
    }

    public function forumPosts()
    {
        return $this->belongsToMany(ForumPost::class, 'forum_post_skill')->withTimestamps();
    }
}
