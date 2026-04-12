<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdminAction extends Model
{
    public const TARGET_USER = 'user';
    public const TARGET_FORUM_POST = 'forum_post';
    public const TARGET_FORUM_REPLY = 'forum_reply';
    public const TARGET_JOB = 'job';
    public const TARGET_CONTENT_REPORT = 'content_report';
    public const TARGET_ADMIN_REPORT = 'admin_report';

    public const ACTION_USER_ROLE_CHANGED = 'user_role_changed';
    public const ACTION_USER_STATUS_CHANGED = 'user_status_changed';
    public const ACTION_CONTENT_APPROVED = 'content_approved';
    public const ACTION_CONTENT_REMOVED = 'content_removed';
    public const ACTION_REPORT_GENERATED = 'report_generated';

    protected $fillable = ['admin_id','action_type','target_type','target_id','reason'];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function admin() { return $this->belongsTo(User::class, 'admin_id'); }
}
