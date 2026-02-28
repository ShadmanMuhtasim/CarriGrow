<?php

namespace App\Models;
use Tymon\JWTAuth\Contracts\JWTSubject;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class User extends Authenticatable implements JWTSubject
{
    use HasFactory, Notifiable;
   
    public const ROLE_JOB_SEEKER = 'job_seeker';
    public const ROLE_EMPLOYER   = 'employer';
    public const ROLE_MENTOR     = 'mentor';
    public const ROLE_ADMIN      = 'admin';

    public const STATUS_ACTIVE = 'active';
    public const STATUS_BANNED = 'banned';

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'status',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    public function jobSeekerProfile()
    {
        return $this->hasOne(JobSeekerProfile::class);
    }

    public function employerProfile()
    {
        return $this->hasOne(EmployerProfile::class);
    }

    public function mentorProfile()
    {
        return $this->hasOne(MentorProfile::class);
    }

    public function skills()
    {
        return $this->belongsToMany(Skill::class)
            ->withPivot('level')
            ->withTimestamps();
    }

    public function jobsPosted()
    {
        return $this->hasMany(Job::class, 'employer_id');
    }

    public function applications()
    {
        return $this->hasMany(JobApplication::class, 'job_seeker_id');
    }

    public function forumPosts()
    {
        return $this->hasMany(ForumPost::class);
    }

    public function forumReplies()
    {
        return $this->hasMany(ForumReply::class);
    }

    public function adminActions()
    {
        return $this->hasMany(AdminAction::class, 'admin_id');
    }

    public function getJWTIdentifier()
{
    return $this->getKey();
}

public function getJWTCustomClaims()
{
    return [];
}

}