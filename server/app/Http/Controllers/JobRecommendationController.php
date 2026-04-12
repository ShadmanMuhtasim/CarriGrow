<?php

namespace App\Http\Controllers;

use App\Models\Job;
use App\Models\JobApplication;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class JobRecommendationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = auth('api')->user();

        if (!$user || $user->role !== User::ROLE_JOB_SEEKER) {
            return response()->json([
                'message' => 'Only job seekers can get job recommendations',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'per_page' => ['sometimes', 'integer', Rule::in([10, 25, 50])],
            'ab_variant' => ['sometimes', Rule::in(['auto', 'a', 'b'])],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $validated = $validator->validated();
        $perPage = (int) ($validated['per_page'] ?? 10);
        $page = $this->sanitizePage($request->query('page', 1));
        $abVariant = $this->resolveAbVariant($user->id, $validated['ab_variant'] ?? 'auto');

        $user->loadMissing('skills');
        $userSkillIds = $user->skills->pluck('id')->map(fn ($id) => (int) $id)->values()->all();
        $userSkillNames = $user->skills
            ->pluck('name')
            ->map(fn ($name) => strtolower(trim((string) $name)))
            ->filter(fn ($name) => $name !== '')
            ->values()
            ->all();

        $appliedJobIds = JobApplication::query()
            ->where('user_id', $user->id)
            ->pluck('job_id')
            ->map(fn ($id) => (int) $id)
            ->values()
            ->all();

        $profile = $this->buildPersonalizationProfile($user);

        $jobs = Job::query()
            ->published()
            ->with(['skills', 'employer.employerProfile'])
            ->when($appliedJobIds !== [], function ($query) use ($appliedJobIds) {
                $query->whereNotIn('id', $appliedJobIds);
            })
            ->get();

        $ranked = $jobs->map(function (Job $job) use ($userSkillIds, $userSkillNames, $profile, $abVariant) {
            $match = $this->calculateMatchForRecommendation($job, $userSkillIds, $userSkillNames);
            $freshnessBoost = $this->calculateFreshnessBoost($job);
            $personalizationBoost = $this->calculatePersonalizationBoost($job, $profile);

            $scoreA = $match['percentage'] + $freshnessBoost + $personalizationBoost;
            $scoreB = (int) round(($match['percentage'] * 0.85) + ($freshnessBoost * 1.25) + ($personalizationBoost * 1.10));
            $score = $abVariant === 'b' ? $scoreB : $scoreA;

            return [
                'job' => $job,
                'score' => $score,
                'match' => $match,
                'freshness_boost' => $freshnessBoost,
                'personalization_boost' => $personalizationBoost,
                'created_ts' => optional($job->created_at)->timestamp ?? 0,
            ];
        })->sort(function (array $left, array $right) {
            if ($left['score'] === $right['score']) {
                return $right['created_ts'] <=> $left['created_ts'];
            }

            return $right['score'] <=> $left['score'];
        })->values();

        $total = $ranked->count();
        $offset = ($page - 1) * $perPage;

        $items = $ranked->slice($offset, $perPage)->values()->map(function (array $row) {
            return [
                'job' => $row['job'],
                'recommendation_score' => $row['score'],
                'match' => $row['match'],
                'signals' => [
                    'freshness_boost' => $row['freshness_boost'],
                    'personalization_boost' => $row['personalization_boost'],
                ],
            ];
        })->all();

        $paginator = new LengthAwarePaginator(
            $items,
            $total,
            $perPage,
            $page,
            [
                'path' => $request->url(),
                'query' => $request->query(),
            ]
        );

        return response()->json([
            'data' => $items,
            'meta' => [
                'ab_variant' => $abVariant,
                'algorithm_version' => 'issue28-base-v1',
                'excluded_already_applied' => count($appliedJobIds),
                'personalization_profile' => $profile,
            ],
            'pagination' => [
                'current_page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'last_page' => $paginator->lastPage(),
            ],
        ]);
    }

    private function calculateMatchForRecommendation(Job $job, array $userSkillIds, array $userSkillNames): array
    {
        $weights = [
            Job::SKILL_IMPORTANCE_REQUIRED => 3,
            Job::SKILL_IMPORTANCE_PREFERRED => 2,
            Job::SKILL_IMPORTANCE_BONUS => 1,
        ];

        $jobSkills = $job->skills;

        if ($jobSkills->isNotEmpty()) {
            $totalWeight = 0;
            $matchedWeight = 0;
            $matchedSkillIds = [];
            $missingSkillIds = [];
            $matchedSkillNames = [];
            $missingSkillNames = [];

            foreach ($jobSkills as $skill) {
                $skillId = (int) $skill->id;
                $skillName = (string) $skill->name;
                $importance = (string) ($skill->pivot->importance ?? Job::SKILL_IMPORTANCE_REQUIRED);
                $weight = $weights[$importance] ?? 1;

                $totalWeight += $weight;

                if (in_array($skillId, $userSkillIds, true)) {
                    $matchedWeight += $weight;
                    $matchedSkillIds[] = $skillId;
                    $matchedSkillNames[] = $skillName;
                } else {
                    $missingSkillIds[] = $skillId;
                    $missingSkillNames[] = $skillName;
                }
            }

            $percentage = $totalWeight > 0 ? (int) round(($matchedWeight / $totalWeight) * 100) : 0;

            return [
                'percentage' => $percentage,
                'matched_skill_ids' => $matchedSkillIds,
                'missing_skill_ids' => $missingSkillIds,
                'matched_skill_names' => $matchedSkillNames,
                'missing_skill_names' => $missingSkillNames,
            ];
        }

        $requiredNames = collect((array) ($job->skills_required ?? []))
            ->map(fn ($name) => strtolower(trim((string) $name)))
            ->filter(fn ($name) => $name !== '')
            ->values();

        if ($requiredNames->isEmpty()) {
            return [
                'percentage' => 0,
                'matched_skill_ids' => [],
                'missing_skill_ids' => [],
                'matched_skill_names' => [],
                'missing_skill_names' => [],
            ];
        }

        $matchedSkillNames = $requiredNames->filter(fn ($name) => in_array($name, $userSkillNames, true))->values()->all();
        $missingSkillNames = $requiredNames->reject(fn ($name) => in_array($name, $userSkillNames, true))->values()->all();
        $percentage = (int) round((count($matchedSkillNames) / max($requiredNames->count(), 1)) * 100);

        return [
            'percentage' => $percentage,
            'matched_skill_ids' => [],
            'missing_skill_ids' => [],
            'matched_skill_names' => $matchedSkillNames,
            'missing_skill_names' => $missingSkillNames,
        ];
    }

    private function calculateFreshnessBoost(Job $job): int
    {
        $createdAt = $job->created_at;

        if (!$createdAt) {
            return 0;
        }

        $daysOld = max((int) $createdAt->diffInDays(now()), 0);

        if ($daysOld <= 7) {
            return 20;
        }

        if ($daysOld <= 30) {
            return 10;
        }

        if ($daysOld <= 60) {
            return 4;
        }

        return 0;
    }

    private function buildPersonalizationProfile(User $user): array
    {
        $history = $user->applications()
            ->with(['job:id,employment_type,location'])
            ->latest('applied_at')
            ->limit(30)
            ->get();

        $preferredEmploymentTypes = $history
            ->pluck('job.employment_type')
            ->filter(fn ($value) => is_string($value) && $value !== '')
            ->countBy()
            ->sortDesc()
            ->keys()
            ->take(2)
            ->values()
            ->all();

        $preferredLocations = $history
            ->pluck('job.location')
            ->filter(fn ($value) => is_string($value) && trim($value) !== '')
            ->map(fn ($value) => strtolower(trim((string) $value)))
            ->countBy()
            ->sortDesc()
            ->keys()
            ->take(2)
            ->values()
            ->all();

        return [
            'preferred_employment_types' => $preferredEmploymentTypes,
            'preferred_locations' => $preferredLocations,
            'history_count' => $history->count(),
        ];
    }

    private function calculatePersonalizationBoost(Job $job, array $profile): int
    {
        $boost = 0;

        $preferredEmploymentTypes = (array) ($profile['preferred_employment_types'] ?? []);
        if (in_array((string) $job->employment_type, $preferredEmploymentTypes, true)) {
            $boost += 8;
        }

        $preferredLocations = (array) ($profile['preferred_locations'] ?? []);
        if ($job->location && $preferredLocations !== []) {
            $jobLocation = strtolower(trim((string) $job->location));
            foreach ($preferredLocations as $location) {
                if ($location !== '' && str_contains($jobLocation, (string) $location)) {
                    $boost += 5;
                    break;
                }
            }
        }

        return $boost;
    }

    private function resolveAbVariant(int $userId, string $requested): string
    {
        if (in_array($requested, ['a', 'b'], true)) {
            return $requested;
        }

        return (crc32('recommendation:' . $userId) % 2) === 0 ? 'a' : 'b';
    }

    private function sanitizePage(mixed $rawPage): int
    {
        $page = filter_var($rawPage, FILTER_VALIDATE_INT, [
            'options' => [
                'default' => 1,
                'min_range' => 1,
            ],
        ]);

        return is_int($page) && $page > 0 ? $page : 1;
    }
}
