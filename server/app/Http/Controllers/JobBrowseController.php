<?php

namespace App\Http\Controllers;

use App\Models\Job;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class JobBrowseController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'per_page' => ['sometimes', 'integer', Rule::in([10, 25, 50])],
            'search' => ['sometimes', 'nullable', 'string', 'max:255'],
            'location' => ['sometimes', 'nullable', 'string', 'max:255'],
            'employment_type' => ['sometimes', 'nullable', Rule::in([
                Job::TYPE_FULL_TIME,
                Job::TYPE_PART_TIME,
                Job::TYPE_CONTRACT,
                Job::TYPE_INTERNSHIP,
            ])],
            'experience_level' => ['sometimes', 'nullable', Rule::in([
                Job::LEVEL_ENTRY,
                Job::LEVEL_MID,
                Job::LEVEL_SENIOR,
                Job::LEVEL_LEAD,
            ])],
            'salary_min' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'salary_max' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'skill_ids' => ['sometimes', 'array'],
            'skill_ids.*' => ['integer', 'exists:skills,id'],
            'posted_within_days' => ['sometimes', 'integer', 'min:1', 'max:365'],
            'sort' => ['sometimes', Rule::in(['newest', 'salary', 'relevance'])],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $filters = $validator->validated();
        $perPage = (int) ($filters['per_page'] ?? 10);
        $page = max((int) $request->integer('page', 1), 1);
        $cacheKey = sprintf(
            'jobs.public.index.v%d.%s.page.%d.per.%d',
            Job::publicCacheVersion(),
            md5(json_encode($filters)),
            $page,
            $perPage
        );

        $jobs = Cache::remember($cacheKey, now()->addMinutes(10), function () use ($filters, $perPage) {
            $query = Job::query()
                ->published()
                ->with(['employer.employerProfile', 'skills']);

            $this->applyFilters($query, $filters);
            $this->applySorting($query, $filters);

            return $query->paginate($perPage)->appends($filters);
        });

        return response()->json($jobs);
    }

    public function featured(): JsonResponse
    {
        $cacheKey = sprintf('jobs.public.featured.v%d', Job::publicCacheVersion());

        $jobs = Cache::remember($cacheKey, now()->addMinutes(15), function () {
            return Job::query()
                ->published()
                ->with(['employer.employerProfile', 'skills'])
                ->orderByDesc('views_count')
                ->orderByDesc('created_at')
                ->limit(6)
                ->get();
        });

        return response()->json([
            'jobs' => $jobs,
        ]);
    }

    public function show(Job $job): JsonResponse
    {
        if ($job->status !== Job::STATUS_PUBLISHED) {
            abort(404);
        }

        $cacheKey = sprintf('jobs.public.show.v%d.%d', Job::publicCacheVersion(), $job->id);
        $jobData = Cache::remember($cacheKey, now()->addMinutes(10), function () use ($job) {
            return Job::query()
                ->published()
                ->with(['employer.employerProfile', 'skills'])
                ->findOrFail($job->id);
        });

        $job->increment('views_count');

        return response()->json([
            'job' => $jobData->fresh(['employer.employerProfile', 'skills']),
        ]);
    }

    private function applyFilters(Builder $query, array $filters): void
    {
        if (!empty($filters['search'])) {
            $search = trim((string) $filters['search']);
            $query->where(function (Builder $builder) use ($search) {
                $builder
                    ->where('title', 'like', '%' . $search . '%')
                    ->orWhere('description', 'like', '%' . $search . '%');
            });
        }

        if (!empty($filters['location'])) {
            $query->where('location', 'like', '%' . $filters['location'] . '%');
        }

        if (!empty($filters['employment_type'])) {
            $query->where('employment_type', $filters['employment_type']);
        }

        if (!empty($filters['experience_level'])) {
            $query->where('experience_level', $filters['experience_level']);
        }

        if (array_key_exists('salary_min', $filters) && $filters['salary_min'] !== null) {
            $query->where(function (Builder $builder) use ($filters) {
                $builder
                    ->whereNull('salary_max')
                    ->orWhere('salary_max', '>=', $filters['salary_min']);
            });
        }

        if (array_key_exists('salary_max', $filters) && $filters['salary_max'] !== null) {
            $query->where(function (Builder $builder) use ($filters) {
                $builder
                    ->whereNull('salary_min')
                    ->orWhere('salary_min', '<=', $filters['salary_max']);
            });
        }

        if (!empty($filters['skill_ids'])) {
            $skillIds = array_values(array_unique(array_map('intval', $filters['skill_ids'])));
            $query->whereHas('skills', function (Builder $builder) use ($skillIds) {
                $builder->whereIn('skills.id', $skillIds);
            });
        }

        if (!empty($filters['posted_within_days'])) {
            $query->where('created_at', '>=', now()->subDays((int) $filters['posted_within_days']));
        }
    }

    private function applySorting(Builder $query, array $filters): void
    {
        $sort = $filters['sort'] ?? 'newest';

        if ($sort === 'salary') {
            $query
                ->orderByDesc('salary_max')
                ->orderByDesc('salary_min')
                ->orderByDesc('created_at');
            return;
        }

        if ($sort === 'relevance' && !empty($filters['search'])) {
            $search = trim((string) $filters['search']);
            $safeSearch = str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $search);
            $prefixLike = $safeSearch . '%';
            $containsLike = '%' . $safeSearch . '%';

            $query->orderByRaw(
                "CASE
                    WHEN title LIKE ? THEN 3
                    WHEN title LIKE ? THEN 2
                    WHEN description LIKE ? THEN 1
                    ELSE 0
                END DESC",
                [$prefixLike, $containsLike, $containsLike]
            )->orderByDesc('created_at');
            return;
        }

        $query->orderByDesc('created_at');
    }
}
