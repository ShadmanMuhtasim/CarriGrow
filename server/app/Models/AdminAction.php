<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdminAction extends Model
{
    public const TARGET_USER = 'user';
    public const TARGET_FORUM_POST = 'forum_post';
    public const TARGET_FORUM_REPLY = 'forum_reply';
    public const TARGET_JOB = 'job';

    protected $fillable = ['admin_id','action_type','target_type','target_id','reason'];

    public function admin() { return $this->belongsTo(User::class, 'admin_id'); }
}