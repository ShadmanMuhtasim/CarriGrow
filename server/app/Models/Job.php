<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Job extends Model
{
    public const STATUS_OPEN   = 'open';
    public const STATUS_CLOSED = 'closed';

    public const TYPE_FULL_TIME = 'full_time';
    public const TYPE_PART_TIME = 'part_time';
    public const TYPE_INTERN    = 'intern';
    public const TYPE_REMOTE    = 'remote';

    protected $fillable = [
        'employer_id','title','description','location','job_type','salary_range','deadline','status'
    ];

    public function employer() { return $this->belongsTo(User::class, 'employer_id'); }

    public function skills() { return $this->belongsToMany(Skill::class, 'job_skill')->withPivot('importance')->withTimestamps(); }

    public function applications() { return $this->hasMany(JobApplication::class); }
}