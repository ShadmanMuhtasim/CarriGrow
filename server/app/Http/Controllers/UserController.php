<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    // GET /users/me
    public function me()
    {
        $user = auth('api')->user();
        $user->load(['skills', 'jobSeekerProfile', 'employerProfile', 'mentorProfile']);

        return response()->json(['user' => $user]);
    }

    // PUT /users/me
    public function updateMe(Request $request)
    {
        $user = auth('api')->user();

        $validator = Validator::make($request->all(), [
            'name' => ['sometimes','string','max:255'],

            // job seeker
            'bio' => ['sometimes','nullable','string'],
            'education' => ['sometimes','nullable','string'],
            'experience' => ['sometimes','nullable','string'],
            'portfolio_url' => ['sometimes','nullable','string','max:255'],
            'linkedin_url' => ['sometimes','nullable','string','max:255'],

            // employer
            'company_name' => ['sometimes','string','max:255'],
            'company_website' => ['sometimes','nullable','string','max:255'],
            'company_description' => ['sometimes','nullable','string'],
            'company_location' => ['sometimes','nullable','string','max:255'],

            // mentor
            'headline' => ['sometimes','nullable','string','max:255'],
            'expertise' => ['sometimes','nullable','string'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        if ($request->has('name')) {
            $user->name = $request->name;
            $user->save();
        }

        if ($user->role === User::ROLE_JOB_SEEKER) {
            $profile = $user->jobSeekerProfile()->firstOrCreate(['user_id' => $user->id]);
            $profile->fill($request->only(['bio','education','experience','portfolio_url','linkedin_url']))->save();
        }

        if ($user->role === User::ROLE_EMPLOYER) {
            $profile = $user->employerProfile()->firstOrCreate(['user_id' => $user->id], [
                'company_name' => $request->input('company_name', 'Company Name')
            ]);
            $profile->fill($request->only(['company_name','company_website','company_description','company_location']))->save();
        }

        if ($user->role === User::ROLE_MENTOR) {
            $profile = $user->mentorProfile()->firstOrCreate(['user_id' => $user->id]);
            $profile->fill($request->only(['headline','bio','expertise']))->save();
        }

        $user->load(['skills', 'jobSeekerProfile', 'employerProfile', 'mentorProfile']);

        return response()->json([
            'message' => 'Profile updated',
            'user' => $user
        ]);
    }

    // POST /users/me/skills
    public function setMySkills(Request $request)
    {
        $user = auth('api')->user();

        $validator = Validator::make($request->all(), [
            'skill_ids' => ['required','array','min:1'],
            'skill_ids.*' => ['integer','exists:skills,id'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user->skills()->sync($request->skill_ids);
        $user->load('skills');

        return response()->json([
            'message' => 'Skills updated',
            'skills' => $user->skills
        ]);
    }
}