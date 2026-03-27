<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Cache;

class Job extends Model
{
    use HasFactory;
    use SoftDeletes;

    public const STATUS_DRAFT = 'draft';
    public const STATUS_PUBLISHED = 'published';
    public const STATUS_CLOSED = 'closed';
    public const STATUS_FILLED = 'filled';

    public const TYPE_FULL_TIME = 'full_time';
    public const TYPE_PART_TIME = 'part_time';
    public const TYPE_CONTRACT = 'contract';
    public const TYPE_INTERNSHIP = 'internship';

    public const LEVEL_ENTRY = 'entry';
    public const LEVEL_MID = 'mid';
    public const LEVEL_SENIOR = 'senior';
    public const LEVEL_LEAD = 'lead';

    protected $fillable = [
        'employer_id',
        'title',
        'description',
        'requirements',
        'responsibilities',
        'location',
        'salary_min',
        'salary_max',
        'salary_currency',
        'employment_type',
        'experience_level',
        'education_required',
        'skills_required',
        'application_deadline',
        'status',
        'views_count',
        'applications_count',
    ];

    protected $casts = [
        'salary_min' => 'decimal:2',
        'salary_max' => 'decimal:2',
        'skills_required' => 'array',
        'application_deadline' => 'date',
        'views_count' => 'integer',
        'applications_count' => 'integer',
        'deleted_at' => 'datetime',
    ];

    public function employer()
    {
        return $this->belongsTo(User::class, 'employer_id');
    }

    public function skills()
    {
        return $this->belongsToMany(Skill::class, 'job_skill')->withPivot('importance')->withTimestamps();
    }

    public function applications()
    {
        return $this->hasMany(JobApplication::class);
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_PUBLISHED);
    }

    public static function publicCacheVersion(): int
    {
        return (int) Cache::get('jobs_public_cache_version', 1);
    }

    public static function bumpPublicCacheVersion(): void
    {
        Cache::forever('jobs_public_cache_version', self::publicCacheVersion() + 1);
    }
}
