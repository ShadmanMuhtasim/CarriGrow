<?php

namespace App\Services;

use App\Models\Job;
use App\Models\JobApplication;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;

class SkillMatchService
{
    public function calculateMatchForUserAndJob(User $user, Job $job): array
    {
        $cacheKey = $this->matchCacheKey($user, $job);

        return Cache::remember($cacheKey, now()->addMinutes(15), function () use ($user, $job) {
            $user->loadMissing('skills');
            $job->loadMissing('skills');

            $userSkills = $user->skills
                ->map(function ($skill) {
                    return [
                        'id' => (int) $skill->id,
                        'name' => trim((string) $skill->name),
                        'normalized_name' => strtolower(trim((string) $skill->name)),
                    ];
                })
                ->filter(fn (array $skill) => $skill['name'] !== '')
                ->values();

            $jobSkills = $job->skills
                ->map(function ($skill) {
                    $importance = (string) data_get($skill, 'pivot.importance', Job::SKILL_IMPORTANCE_REQUIRED);

                    return [
                        'id' => (int) $skill->id,
                        'name' => trim((string) $skill->name),
                        'normalized_name' => strtolower(trim((string) $skill->name)),
                        'importance' => $importance,
                        'weight' => $this->importanceWeight($importance),
                    ];
                })
                ->filter(fn (array $skill) => $skill['name'] !== '')
                ->values();

            if ($jobSkills->isNotEmpty()) {
                return $this->buildWeightedMatchPayload($jobSkills, $userSkills);
            }

            return $this->buildFallbackMatchPayload($job, $userSkills);
        });
    }

    public function getRecommendedJobsForUser(User $user, int $perPage = 10): array
    {
        $resolvedPerPage = in_array($perPage, [10, 25, 50], true) ? $perPage : 10;
        $cacheKey = $this->recommendationCacheKey($user, $resolvedPerPage);

        return Cache::remember($cacheKey, now()->addMinutes(15), function () use ($user, $resolvedPerPage) {
            $user->loadMissing('skills');

            $appliedJobIds = JobApplication::query()
                ->where('user_id', $user->id)
                ->pluck('job_id')
                ->map(fn ($id) => (int) $id)
                ->values()
                ->all();

            $jobs = Job::query()
                ->published()
                ->with(['skills', 'employer.employerProfile'])
                ->when($appliedJobIds !== [], function ($query) use ($appliedJobIds) {
                    $query->whereNotIn('id', $appliedJobIds);
                })
                ->limit(50)
                ->get();

            return $jobs
                ->map(function (Job $job) use ($user) {
                    $match = $this->calculateMatchForUserAndJob($user, $job);

                    return [
                        'job' => $job,
                        'match' => $match,
                        'score' => $match['percentage'],
                        'created_ts' => optional($job->created_at)->timestamp ?? 0,
                    ];
                })
                ->sort(function (array $left, array $right) {
                    if ($left['score'] === $right['score']) {
                        return $right['created_ts'] <=> $left['created_ts'];
                    }

                    return $right['score'] <=> $left['score'];
                })
                ->take($resolvedPerPage)
                ->values()
                ->map(function (array $row) {
                    return [
                        'job' => $row['job'],
                        'match' => $row['match'],
                    ];
                })
                ->all();
        });
    }

    private function buildWeightedMatchPayload(Collection $jobSkills, Collection $userSkills): array
    {
        $weights = $jobSkills->sum('weight');
        $userSkillIds = $userSkills->pluck('id')->all();
        $userSkillNames = $userSkills->pluck('normalized_name')->all();

        $matchedSkills = [];
        $missingSkills = [];
        $matchedWeight = 0;

        foreach ($jobSkills as $jobSkill) {
            $matchedById = $jobSkill['id'] > 0 && in_array($jobSkill['id'], $userSkillIds, true);
            $matchedByName = in_array($jobSkill['normalized_name'], $userSkillNames, true);

            if ($matchedById || $matchedByName) {
                $matchedSkills[] = [
                    'id' => $jobSkill['id'],
                    'name' => $jobSkill['name'],
                    'importance' => $jobSkill['importance'],
                    'weight' => $jobSkill['weight'],
                ];
                $matchedWeight += $jobSkill['weight'];
                continue;
            }

            $missingSkills[] = [
                'id' => $jobSkill['id'],
                'name' => $jobSkill['name'],
                'importance' => $jobSkill['importance'],
                'weight' => $jobSkill['weight'],
            ];
        }

        $percentage = $weights > 0 ? (int) round(($matchedWeight / $weights) * 100) : 0;

        return [
            'percentage' => $percentage,
            'matched_skills' => $matchedSkills,
            'missing_skills' => $missingSkills,
            'suggested_skills' => $this->buildSuggestedSkills($missingSkills),
            'total_weight' => $weights,
            'matched_weight' => $matchedWeight,
            'algorithm_version' => 'issue26-base-v1',
            'source' => 'job_skill',
        ];
    }

    private function buildFallbackMatchPayload(Job $job, Collection $userSkills): array
    {
        $requiredSkills = collect((array) ($job->skills_required ?? []))
            ->map(fn ($skillName) => trim((string) $skillName))
            ->filter(fn ($skillName) => $skillName !== '')
            ->values();

        $userSkillNames = $userSkills->pluck('normalized_name')->all();
        $matchedSkills = [];
        $missingSkills = [];

        foreach ($requiredSkills as $skillName) {
            $normalizedName = strtolower($skillName);
            if (in_array($normalizedName, $userSkillNames, true)) {
                $matchedSkills[] = [
                    'id' => null,
                    'name' => $skillName,
                    'importance' => Job::SKILL_IMPORTANCE_REQUIRED,
                    'weight' => 1,
                ];
                continue;
            }

            $missingSkills[] = [
                'id' => null,
                'name' => $skillName,
                'importance' => Job::SKILL_IMPORTANCE_REQUIRED,
                'weight' => 1,
            ];
        }

        $totalWeight = $requiredSkills->count();
        $matchedWeight = count($matchedSkills);
        $percentage = $totalWeight > 0 ? (int) round(($matchedWeight / $totalWeight) * 100) : 0;

        return [
            'percentage' => $percentage,
            'matched_skills' => $matchedSkills,
            'missing_skills' => $missingSkills,
            'suggested_skills' => $this->buildSuggestedSkills($missingSkills),
            'total_weight' => $totalWeight,
            'matched_weight' => $matchedWeight,
            'algorithm_version' => 'issue26-base-v1',
            'source' => 'skills_required',
        ];
    }

    private function buildSuggestedSkills(array $missingSkills): array
    {
        return collect($missingSkills)
            ->sortByDesc('weight')
            ->pluck('name')
            ->filter(fn ($name) => is_string($name) && trim($name) !== '')
            ->values()
            ->all();
    }

    private function importanceWeight(string $importance): int
    {
        return match ($importance) {
            Job::SKILL_IMPORTANCE_REQUIRED => 3,
            Job::SKILL_IMPORTANCE_PREFERRED => 2,
            Job::SKILL_IMPORTANCE_BONUS => 1,
            default => 1,
        };
    }

    private function matchCacheKey(User $user, Job $job): string
    {
        $userSkillVersion = $this->relationVersion($user->skills()->max('skill_user.updated_at'));
        $jobSkillVersion = $this->relationVersion($job->skills()->max('job_skill.updated_at'));
        $jobVersion = $this->relationVersion($job->updated_at);

        return sprintf(
            'skill-match:user:%d:job:%d:user-skills:%s:job-skills:%s:job:%s',
            $user->id,
            $job->id,
            $userSkillVersion,
            $jobSkillVersion,
            $jobVersion
        );
    }

    private function recommendationCacheKey(User $user, int $perPage): string
    {
        $userVersion = $this->relationVersion($user->updated_at);
        $userSkillVersion = $this->relationVersion($user->skills()->max('skill_user.updated_at'));
        $applicationsVersion = $this->relationVersion($user->applications()->max('updated_at'));
        $jobVersion = $this->relationVersion(Job::query()->max('updated_at'));

        return sprintf(
            'skill-match:recommended:user:%d:per-page:%d:user:%s:user-skills:%s:applications:%s:jobs:%s',
            $user->id,
            $perPage,
            $userVersion,
            $userSkillVersion,
            $applicationsVersion,
            $jobVersion
        );
    }

    private function relationVersion(mixed $value): string
    {
        return $value ? (string) $value : 'none';
    }
}
