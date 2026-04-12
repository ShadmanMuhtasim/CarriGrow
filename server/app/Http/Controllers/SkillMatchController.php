<?php

namespace App\Http\Controllers;

use App\Models\Job;
use App\Models\User;
use App\Services\SkillMatchService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class SkillMatchController extends Controller
{
    public function __construct(private readonly SkillMatchService $skillMatchService)
    {
    }

    public function matchScore(Job $job): JsonResponse
    {
        $user = auth('api')->user();

        if (!$user || $user->role !== User::ROLE_JOB_SEEKER) {
            return response()->json([
                'message' => 'Only job seekers can view job match scores',
            ], 403);
        }

        if ($job->status !== Job::STATUS_PUBLISHED) {
            abort(404);
        }

        return response()->json([
            'job_id' => $job->id,
            'user_id' => $user->id,
            'match' => $this->skillMatchService->calculateMatchForUserAndJob($user, $job),
        ]);
    }

    public function recommendedJobs(Request $request, User $user): JsonResponse
    {
        $authUser = auth('api')->user();

        if (!$authUser) {
            return response()->json([
                'message' => 'Unauthenticated',
            ], 401);
        }

        if ($authUser->id !== $user->id && $authUser->role !== User::ROLE_ADMIN) {
            return response()->json([
                'message' => 'You are not allowed to view recommendations for this user',
            ], 403);
        }

        if ($user->role !== User::ROLE_JOB_SEEKER) {
            return response()->json([
                'message' => 'Recommendations are only available for job seekers',
            ], 422);
        }

        $validator = Validator::make($request->all(), [
            'per_page' => ['sometimes', 'integer', Rule::in([10, 25, 50])],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $perPage = (int) ($validator->validated()['per_page'] ?? 10);

        return response()->json([
            'user_id' => $user->id,
            'data' => $this->skillMatchService->getRecommendedJobsForUser($user, $perPage),
            'meta' => [
                'algorithm_version' => 'issue26-base-v1',
                'per_page' => $perPage,
            ],
        ]);
    }
}
