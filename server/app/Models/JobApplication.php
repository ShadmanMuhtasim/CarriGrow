<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JobApplication extends Model
{
    use HasFactory;

    public const STATUS_APPLIED = 'applied';
    public const STATUS_UNDER_REVIEW = 'under_review';
    public const STATUS_SHORTLISTED = 'shortlisted';
    public const STATUS_REJECTED    = 'rejected';
    public const STATUS_HIRED = 'hired';

    protected $fillable = [
        'job_id',
        'user_id',
        'cover_letter',
        'resume_url',
        'additional_documents',
        'status',
        'employer_notes',
        'applied_at',
        'reviewed_at',
        'reviewed_by',
    ];

    protected $casts = [
        'additional_documents' => 'array',
        'applied_at' => 'datetime',
        'reviewed_at' => 'datetime',
    ];

    public function job()
    {
        return $this->belongsTo(Job::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function reviewedBy()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function jobSeeker()
    {
        return $this->user();
    }
}
