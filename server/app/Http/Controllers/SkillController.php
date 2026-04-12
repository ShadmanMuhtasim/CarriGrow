<?php

namespace App\Http\Controllers;

use App\Models\Skill;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SkillController extends Controller
{
    public function index()
    {
        return response()->json([
            'skills' => Skill::orderBy('category')->orderBy('name')->get()
        ]);
    }

    public function userSkills(User $user)
    {
        $user->load(['skills' => function ($query) {
            $query->orderBy('name');
        }]);

        return response()->json([
            'user_id' => $user->id,
            'skills' => $user->skills,
        ]);
    }

    public function attachUserSkill(Request $request, User $user)
    {
        $this->authorizeSkillMutation($user);

        $validated = $request->validate([
            'skill_id' => ['required', 'integer', 'exists:skills,id'],
            'proficiency_level' => ['required', Rule::in(['beginner', 'intermediate', 'advanced', 'expert'])],
        ]);

        $skillId = (int) $validated['skill_id'];
        $proficiency = $validated['proficiency_level'];

        $hasSkill = $user->skills()->where('skills.id', $skillId)->exists();
        if ($hasSkill) {
            $user->skills()->updateExistingPivot($skillId, ['proficiency_level' => $proficiency]);
        } else {
            $user->skills()->attach($skillId, ['proficiency_level' => $proficiency]);
        }

        $user->load('skills');

        return response()->json([
            'message' => 'Skill saved',
            'skills' => $user->skills,
        ]);
    }

    public function detachUserSkill(User $user, Skill $skill)
    {
        $this->authorizeSkillMutation($user);

        $user->skills()->detach($skill->id);
        $user->load('skills');

        return response()->json([
            'message' => 'Skill removed',
            'skills' => $user->skills,
        ]);
    }

    private function authorizeSkillMutation(User $targetUser): void
    {
        $authUser = auth('api')->user();
        if (!$authUser) {
            abort(401, 'Unauthenticated.');
        }

        if ($authUser->id !== $targetUser->id && $authUser->role !== User::ROLE_ADMIN) {
            abort(403, 'Forbidden.');
        }
    }
}
