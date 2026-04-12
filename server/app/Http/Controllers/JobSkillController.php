<?php

namespace App\Http\Controllers;

use App\Models\Job;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class JobSkillController extends Controller
{
    private const IMPORTANCE_VALUES = [
        Job::SKILL_IMPORTANCE_REQUIRED,
        Job::SKILL_IMPORTANCE_PREFERRED,
        Job::SKILL_IMPORTANCE_BONUS,
    ];

    public function index(Job $job): JsonResponse
    {
        $job->load(['skills' => function ($query) {
            $query->orderBy('name');
        }]);

        $response = [
            'job_id' => $job->id,
            'skills' => $job->skills,
        ];

        $authUser = auth('api')->user();
        if ($authUser && $authUser->role === User::ROLE_JOB_SEEKER) {
            $userSkillIds = $authUser->skills()->pluck('skills.id')->all();
            $response['match'] = $job->calculateSkillMatch($userSkillIds);
        }

        return response()->json($response);
    }

    public function store(Request $request, Job $job): JsonResponse
    {
        $user = auth('api')->user();
        $guardResponse = $this->ensureEmployerOwnsJob($user, $job);

        if ($guardResponse !== null) {
            return $guardResponse;
        }

        $input = $request->all();

        if ($request->has('skill_id') && !$request->has('skills')) {
            $input['skills'] = [[
                'skill_id' => (int) $request->input('skill_id'),
                'importance' => $request->input('importance', Job::SKILL_IMPORTANCE_REQUIRED),
            ]];
        }

        $validator = Validator::make($input, [
            'skills' => ['required', 'array', 'min:1'],
            'skills.*.skill_id' => ['required', 'integer', 'exists:skills,id'],
            'skills.*.importance' => ['required', Rule::in(self::IMPORTANCE_VALUES)],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $syncPayload = collect($validator->validated()['skills'])
            ->mapWithKeys(function (array $skill) {
                return [
                    (int) $skill['skill_id'] => ['importance' => $skill['importance']],
                ];
            })->all();

        $job->skills()->syncWithoutDetaching($syncPayload);
        $job->load(['skills' => function ($query) {
            $query->orderBy('name');
        }]);

        return response()->json([
            'message' => 'Job skills saved',
            'job_id' => $job->id,
            'skills' => $job->skills,
        ]);
    }

    private function ensureEmployerOwnsJob(?User $user, Job $job): ?JsonResponse
    {
        if (!$user || $user->role !== User::ROLE_EMPLOYER) {
            return response()->json([
                'message' => 'Only employers can manage job skills',
            ], 403);
        }

        if ($job->employer_id !== $user->id) {
            return response()->json([
                'message' => 'You are not allowed to manage skills for this job',
            ], 403);
        }

        return null;
    }
}
