<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JobApplication extends Model
{
    public const STATUS_APPLIED     = 'applied';
    public const STATUS_REVIEWED    = 'reviewed';
    public const STATUS_SHORTLISTED = 'shortlisted';
    public const STATUS_REJECTED    = 'rejected';

    protected $fillable = ['job_id','job_seeker_id','cover_letter','cv_url','status','applied_at'];

    protected $casts = ['applied_at' => 'datetime'];

    public function job() { return $this->belongsTo(Job::class); }

    public function jobSeeker() { return $this->belongsTo(User::class, 'job_seeker_id'); }
}