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

    public const SKILL_IMPORTANCE_REQUIRED = 'required';
    public const SKILL_IMPORTANCE_PREFERRED = 'preferred';
    public const SKILL_IMPORTANCE_BONUS = 'bonus';

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

    public function calculateSkillMatch(array $userSkillIds): array
    {
        $normalizedUserSkillIds = array_values(array_unique(array_map('intval', $userSkillIds)));
        $jobSkills = $this->skills()->get();

        if ($jobSkills->isEmpty()) {
            return [
                'percentage' => 0,
                'matched_skill_ids' => [],
                'missing_skill_ids' => [],
                'total_weight' => 0,
                'matched_weight' => 0,
            ];
        }

        $weights = [
            self::SKILL_IMPORTANCE_REQUIRED => 3,
            self::SKILL_IMPORTANCE_PREFERRED => 2,
            self::SKILL_IMPORTANCE_BONUS => 1,
        ];

        $totalWeight = 0;
        $matchedWeight = 0;
        $matchedSkillIds = [];
        $missingSkillIds = [];

        foreach ($jobSkills as $skill) {
            $importance = (string) ($skill->pivot->importance ?? self::SKILL_IMPORTANCE_REQUIRED);
            $weight = $weights[$importance] ?? 1;
            $skillId = (int) $skill->id;

            $totalWeight += $weight;

            if (in_array($skillId, $normalizedUserSkillIds, true)) {
                $matchedWeight += $weight;
                $matchedSkillIds[] = $skillId;
            } else {
                $missingSkillIds[] = $skillId;
            }
        }

        $percentage = $totalWeight > 0 ? (int) round(($matchedWeight / $totalWeight) * 100) : 0;

        return [
            'percentage' => $percentage,
            'matched_skill_ids' => $matchedSkillIds,
            'missing_skill_ids' => $missingSkillIds,
            'total_weight' => $totalWeight,
            'matched_weight' => $matchedWeight,
        ];
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
