<?php

namespace App\Http\Controllers;

use App\Models\Job;
use App\Models\JobApplication;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class JobApplicationController extends Controller
{
    public function apply(Request $request, Job $job): JsonResponse
    {
        $user = auth('api')->user();
        $guardResponse = $this->ensureJobSeeker($user);

        if ($guardResponse !== null) {
            return $guardResponse;
        }

        if ($job->status !== Job::STATUS_PUBLISHED) {
            return response()->json([
                'message' => 'You can only apply to published jobs',
            ], 422);
        }

        $validator = Validator::make($request->all(), [
            'cover_letter' => ['sometimes', 'nullable', 'string'],
            'resume_url' => ['required', 'string', 'max:255'],
            'additional_documents' => ['sometimes', 'nullable', 'array'],
            'additional_documents.*' => ['string', 'max:255'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $alreadyApplied = JobApplication::query()
            ->where('job_id', $job->id)
            ->where('user_id', $user->id)
            ->exists();

        if ($alreadyApplied) {
            return response()->json([
                'message' => 'You have already applied to this job',
            ], 409);
        }

        $validated = $validator->validated();

        try {
            $application = JobApplication::query()->create([
                'job_id' => $job->id,
                'user_id' => $user->id,
                'cover_letter' => $validated['cover_letter'] ?? null,
                'resume_url' => $validated['resume_url'],
                'additional_documents' => $validated['additional_documents'] ?? null,
                'status' => JobApplication::STATUS_APPLIED,
                'applied_at' => now(),
            ]);
        } catch (QueryException $exception) {
            if ((string) $exception->getCode() === '23000') {
                return response()->json([
                    'message' => 'You have already applied to this job',
                ], 409);
            }

            throw $exception;
        }

        $job->increment('applications_count');

        return response()->json([
            'message' => 'Application submitted successfully',
            'application' => $application->load(['job.skills', 'job.employer.employerProfile', 'user']),
        ], 201);
    }

    public function indexForJobSeeker(Request $request): JsonResponse
    {
        $user = auth('api')->user();
        $guardResponse = $this->ensureJobSeeker($user);

        if ($guardResponse !== null) {
            return $guardResponse;
        }

        $validator = Validator::make($request->all(), [
            'status' => ['sometimes', Rule::in($this->statusValues())],
            'per_page' => ['sometimes', 'integer', Rule::in([10, 25, 50])],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $validated = $validator->validated();
        $perPage = (int) ($validated['per_page'] ?? 10);

        $query = JobApplication::query()
            ->where('user_id', $user->id)
            ->with(['job.employer.employerProfile', 'job.skills', 'reviewedBy'])
            ->orderByDesc('applied_at')
            ->orderByDesc('id');

        if (!empty($validated['status'])) {
            $query->where('status', $validated['status']);
        }

        $applications = $query->paginate($perPage)->appends($validated);

        return response()->json($applications);
    }

    public function indexForEmployer(Request $request, Job $job): JsonResponse
    {
        $user = auth('api')->user();
        $guardResponse = $this->ensureEmployerOwnsJob($user, $job);

        if ($guardResponse !== null) {
            return $guardResponse;
        }

        $validator = Validator::make($request->all(), [
            'status' => ['sometimes', Rule::in($this->statusValues())],
            'per_page' => ['sometimes', 'integer', Rule::in([10, 25, 50])],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $validated = $validator->validated();
        $perPage = (int) ($validated['per_page'] ?? 10);

        $query = JobApplication::query()
            ->where('job_id', $job->id)
            ->with(['user.jobSeekerProfile', 'reviewedBy'])
            ->orderByDesc('applied_at')
            ->orderByDesc('id');

        if (!empty($validated['status'])) {
            $query->where('status', $validated['status']);
        }

        $applications = $query->paginate($perPage)->appends($validated);

        return response()->json([
            'job' => $job,
            'applications' => $applications,
        ]);
    }

    private function statusValues(): array
    {
        return [
            JobApplication::STATUS_APPLIED,
            JobApplication::STATUS_UNDER_REVIEW,
            JobApplication::STATUS_SHORTLISTED,
            JobApplication::STATUS_REJECTED,
            JobApplication::STATUS_HIRED,
        ];
    }

    private function ensureJobSeeker(?User $user): ?JsonResponse
    {
        if (!$user || $user->role !== User::ROLE_JOB_SEEKER) {
            return response()->json([
                'message' => 'Only job seekers can apply to jobs',
            ], 403);
        }

        return null;
    }

    private function ensureEmployer(?User $user): ?JsonResponse
    {
        if (!$user || $user->role !== User::ROLE_EMPLOYER) {
            return response()->json([
                'message' => 'Only employers can view applicants',
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
                'message' => 'You are not allowed to view applications for this job',
            ], 403);
        }

        return null;
    }
}
