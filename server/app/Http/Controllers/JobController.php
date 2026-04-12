<?php

namespace App\Http\Controllers;

use App\Models\Job;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class JobController extends Controller
{
    public function index(): JsonResponse
    {
        $user = auth('api')->user();
        $guardResponse = $this->ensureEmployer($user);

        if ($guardResponse !== null) {
            return $guardResponse;
        }

        $jobs = Job::query()
            ->where('employer_id', $user->id)
            ->latest('created_at')
            ->get();

        return response()->json([
            'jobs' => $jobs,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $user = auth('api')->user();
        $guardResponse = $this->ensureEmployer($user);

        if ($guardResponse !== null) {
            return $guardResponse;
        }

        $validator = Validator::make($request->all(), $this->rules());

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $job = new Job($this->validatedPayload($validator->validated()));
        $job->employer_id = $user->id;
        $job->save();
        Job::bumpPublicCacheVersion();

        return response()->json([
            'message' => 'Job created successfully',
            'job' => $job,
        ], 201);
    }

    public function show(Job $job): JsonResponse
    {
        $user = auth('api')->user();
        $guardResponse = $this->ensureEmployerOwnsJob($user, $job);

        if ($guardResponse !== null) {
            return $guardResponse;
        }

        return response()->json([
            'job' => $job,
        ]);
    }

    public function update(Request $request, Job $job): JsonResponse
    {
        $user = auth('api')->user();
        $guardResponse = $this->ensureEmployerOwnsJob($user, $job);

        if ($guardResponse !== null) {
            return $guardResponse;
        }

        $validator = Validator::make($request->all(), $this->rules(true));

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $job->fill($this->validatedPayload($validator->validated()));
        $job->save();
        Job::bumpPublicCacheVersion();

        return response()->json([
            'message' => 'Job updated successfully',
            'job' => $job,
        ]);
    }

    public function destroy(Job $job): JsonResponse
    {
        $user = auth('api')->user();
        $guardResponse = $this->ensureEmployerOwnsJob($user, $job);

        if ($guardResponse !== null) {
            return $guardResponse;
        }

        $job->delete();
        Job::bumpPublicCacheVersion();

        return response()->json([
            'message' => 'Job deleted successfully',
        ]);
    }

    private function rules(bool $isUpdate = false): array
    {
        $required = $isUpdate ? ['sometimes'] : ['required'];

        return [
            'title' => array_merge($required, ['string', 'max:255']),
            'description' => array_merge($required, ['string']),
            'requirements' => ['sometimes', 'nullable', 'string'],
            'responsibilities' => ['sometimes', 'nullable', 'string'],
            'location' => ['sometimes', 'nullable', 'string', 'max:255'],
            'salary_min' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'salary_max' => ['sometimes', 'nullable', 'numeric', 'gte:salary_min'],
            'salary_currency' => ['sometimes', 'nullable', 'string', 'max:10'],
            'employment_type' => ['sometimes', Rule::in([
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
            'education_required' => ['sometimes', 'nullable', 'string', 'max:255'],
            'skills_required' => ['sometimes', 'nullable', 'array'],
            'skills_required.*' => ['string', 'max:255'],
            'application_deadline' => ['sometimes', 'nullable', 'date'],
            'status' => ['sometimes', Rule::in([
                Job::STATUS_DRAFT,
                Job::STATUS_PUBLISHED,
                Job::STATUS_CLOSED,
                Job::STATUS_FILLED,
            ])],
            'views_count' => ['sometimes', 'integer', 'min:0'],
            'applications_count' => ['sometimes', 'integer', 'min:0'],
        ];
    }

    private function validatedPayload(array $validated): array
    {
        if (array_key_exists('salary_currency', $validated) && $validated['salary_currency'] !== null) {
            $validated['salary_currency'] = strtoupper($validated['salary_currency']);
        }

        if (array_key_exists('skills_required', $validated) && $validated['skills_required'] !== null) {
            $validated['skills_required'] = array_values($validated['skills_required']);
        }

        return $validated;
    }

    private function ensureEmployer(?User $user): ?JsonResponse
    {
        if (!$user || $user->role !== User::ROLE_EMPLOYER) {
            return response()->json([
                'message' => 'Only employers can manage jobs',
            ], 403);
        }

        return null;
    }

    private function ensureEmployerOwnsJob(?User $user, Job $job): ?JsonResponse
    {
        $guardResponse = $this->ensureEmployer($user);

        if ($guardResponse !== null) {
            return $guardResponse;
        }

        if ($job->employer_id !== $user->id) {
            return response()->json([
                'message' => 'You are not allowed to manage this job',
            ], 403);
        }

        return null;
    }
}
