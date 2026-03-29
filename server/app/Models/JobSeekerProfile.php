<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JobSeekerProfile extends Model
{
    protected $fillable = [
        'user_id',
        'phone',
        'location',
        'bio',
        'education',
        'experience',
        'resume_url',
        'portfolio_url',
        'linkedin_url',
        'github_url',
        'date_of_birth',
        'gender',
    ];

    protected $casts = [
        'education' => 'array',
        'experience' => 'array',
        'date_of_birth' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
