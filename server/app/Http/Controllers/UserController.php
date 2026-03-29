<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Validation\Rule;
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
        $currentYear = (int) date('Y');

        $validator = Validator::make($request->all(), [
            'name' => ['sometimes','string','max:255'],

            // job seeker
            'phone' => ['sometimes', 'nullable', 'string', 'max:50'],
            'location' => ['sometimes', 'nullable', 'string', 'max:255'],
            'bio' => ['sometimes','nullable','string'],
            'education' => ['sometimes', 'nullable'],
            'experience' => ['sometimes', 'nullable'],
            'resume_url' => ['sometimes', 'nullable', 'url', 'max:255'],
            'portfolio_url' => ['sometimes','nullable','url','max:255'],
            'linkedin_url' => ['sometimes','nullable','url','max:255'],
            'github_url' => ['sometimes', 'nullable', 'url', 'max:255'],
            'date_of_birth' => ['sometimes', 'nullable', 'date'],
            'gender' => ['sometimes', 'nullable', Rule::in(['male', 'female', 'other', 'prefer_not_to_say'])],

            // employer
            'company_name' => ['sometimes','string','max:255'],
            'company_website' => ['sometimes','nullable','url','max:255'],
            'company_logo_url' => ['sometimes', 'nullable', 'url', 'max:255'],
            'company_description' => ['sometimes','nullable','string'],
            'industry' => ['sometimes', 'nullable', 'string', 'max:255'],
            'company_size' => ['sometimes', 'nullable', Rule::in(['1-10', '11-50', '51-200', '201-500', '500+'])],
            'founded_year' => ['sometimes', 'nullable', 'integer', 'min:1800', 'max:' . $currentYear],
            'headquarters_location' => ['sometimes','nullable','string','max:255'],
            'contact_email' => ['sometimes', 'nullable', 'email', 'max:255'],
            'contact_phone' => ['sometimes', 'nullable', 'string', 'max:50'],

            // mentor
            'current_position' => ['sometimes', 'nullable', 'string', 'max:255'],
            'company' => ['sometimes', 'nullable', 'string', 'max:255'],
            'years_of_experience' => ['sometimes', 'nullable', 'integer', 'min:0', 'max:80'],
            'expertise_areas' => ['sometimes', 'nullable'],
            'calendly_link' => ['sometimes', 'nullable', 'url', 'max:255'],
            'availability' => ['sometimes', 'nullable'],
            'mentorship_areas' => ['sometimes', 'nullable'],
            'hourly_rate' => ['sometimes', 'nullable', 'numeric', 'min:0'],
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
            $profileData = $request->only([
                'phone',
                'location',
                'bio',
                'resume_url',
                'portfolio_url',
                'linkedin_url',
                'github_url',
                'date_of_birth',
                'gender',
            ]);
            $profileData['education'] = $this->normalizeJsonArray($request->input('education'));
            $profileData['experience'] = $this->normalizeJsonArray($request->input('experience'));
            $profile->fill($profileData)->save();
        }

        if ($user->role === User::ROLE_EMPLOYER) {
            $profile = $user->employerProfile()->firstOrCreate(['user_id' => $user->id], [
                'company_name' => $request->input('company_name', 'Company Name')
            ]);
            $profile->fill($request->only([
                'company_name',
                'company_website',
                'company_logo_url',
                'company_description',
                'industry',
                'company_size',
                'founded_year',
                'headquarters_location',
                'contact_email',
                'contact_phone',
            ]))->save();
        }

        if ($user->role === User::ROLE_MENTOR) {
            $profile = $user->mentorProfile()->firstOrCreate(['user_id' => $user->id]);
            $profileData = $request->only([
                'current_position',
                'company',
                'years_of_experience',
                'bio',
                'linkedin_url',
                'calendly_link',
                'hourly_rate',
            ]);
            $profileData['expertise_areas'] = $this->normalizeJsonArray($request->input('expertise_areas'));
            $profileData['availability'] = $this->normalizeJsonArray($request->input('availability'));
            $profileData['mentorship_areas'] = $this->normalizeJsonArray($request->input('mentorship_areas'));
            $profile->fill($profileData)->save();
        }

        $user->load(['skills', 'jobSeekerProfile', 'employerProfile', 'mentorProfile']);

        return response()->json([
            'message' => 'Profile updated',
            'user' => $user
        ]);
    }

    // DELETE /users/me/profile
    public function deleteMyProfile()
    {
        $user = auth('api')->user();

        if ($user->role === User::ROLE_JOB_SEEKER) {
            $user->jobSeekerProfile()->delete();
        } elseif ($user->role === User::ROLE_EMPLOYER) {
            $user->employerProfile()->delete();
        } elseif ($user->role === User::ROLE_MENTOR) {
            $user->mentorProfile()->delete();
        }

        $user->load(['skills', 'jobSeekerProfile', 'employerProfile', 'mentorProfile']);

        return response()->json([
            'message' => 'Profile deleted',
            'user' => $user,
        ]);
    }

    // POST /users/me/skills
    public function setMySkills(Request $request)
    {
        $user = auth('api')->user();

        $input = $request->all();

        if ($request->has('skill_ids') && !$request->has('skills')) {
            $input['skills'] = collect((array) $request->input('skill_ids'))
                ->map(function ($id) {
                    return [
                        'skill_id' => (int) $id,
                        'proficiency_level' => 'beginner',
                    ];
                })
                ->values()
                ->all();
        }

        $validator = Validator::make($input, [
            'skills' => ['required', 'array', 'min:1'],
            'skills.*.skill_id' => ['required', 'integer', 'exists:skills,id'],
            'skills.*.proficiency_level' => ['required', Rule::in(['beginner', 'intermediate', 'advanced', 'expert'])],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $syncPayload = collect($input['skills'])->mapWithKeys(function (array $skill) {
            return [
                (int) $skill['skill_id'] => ['proficiency_level' => $skill['proficiency_level']],
            ];
        })->all();

        $user->skills()->sync($syncPayload);
        $user->load('skills');

        return response()->json([
            'message' => 'Skills updated',
            'skills' => $user->skills
        ]);
    }

    private function normalizeJsonArray(mixed $value): ?array
    {
        if ($value === null) {
            return null;
        }

        if (is_array($value)) {
            return array_values(array_filter(array_map(function ($item) {
                return is_scalar($item) ? trim((string) $item) : null;
            }, $value), function ($item) {
                return $item !== null && $item !== '';
            }));
        }

        if (is_string($value)) {
            $chunks = preg_split('/[\r\n,]+/', $value) ?: [];
            $normalized = array_values(array_filter(array_map('trim', $chunks), function ($item) {
                return $item !== '';
            }));
            return $normalized === [] ? null : $normalized;
        }

        return null;
    }
}
