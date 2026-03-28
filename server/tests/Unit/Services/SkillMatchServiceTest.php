<?php

namespace Tests\Unit\Services;

use App\Models\Job;
use App\Models\Skill;
use App\Models\User;
use App\Services\SkillMatchService;
use Illuminate\Support\Collection;
use PHPUnit\Framework\TestCase;

class SkillMatchServiceTest extends TestCase
{
    public function test_it_calculates_weighted_match_from_job_skill_relationships(): void
    {
        $service = new SkillMatchService();
        $user = new User(['id' => 7, 'role' => User::ROLE_JOB_SEEKER]);
        $job = new Job(['id' => 16, 'status' => Job::STATUS_PUBLISHED]);

        $user->setRelation('skills', new Collection([
            $this->makeUserSkill(1, 'Laravel'),
            $this->makeUserSkill(2, 'PHP'),
        ]));

        $job->setRelation('skills', new Collection([
            $this->makeJobSkill(1, 'Laravel', Job::SKILL_IMPORTANCE_REQUIRED),
            $this->makeJobSkill(3, 'MySQL', Job::SKILL_IMPORTANCE_PREFERRED),
            $this->makeJobSkill(4, 'Docker', Job::SKILL_IMPORTANCE_BONUS),
        ]));

        $result = $service->calculateMatchForUserAndJob($user, $job);

        $this->assertSame(50, $result['percentage']);
        $this->assertCount(1, $result['matched_skills']);
        $this->assertSame('Laravel', $result['matched_skills'][0]['name']);
        $this->assertSame(['MySQL', 'Docker'], $result['suggested_skills']);
        $this->assertSame('job_skill', $result['source']);
    }

    public function test_it_falls_back_to_skills_required_when_job_skill_relation_is_empty(): void
    {
        $service = new SkillMatchService();
        $user = new User(['id' => 8, 'role' => User::ROLE_JOB_SEEKER]);
        $job = new Job([
            'id' => 18,
            'status' => Job::STATUS_PUBLISHED,
            'skills_required' => ['React', 'TypeScript', 'Communication'],
        ]);

        $user->setRelation('skills', new Collection([
            $this->makeUserSkill(10, 'React'),
            $this->makeUserSkill(11, 'Communication'),
        ]));
        $job->setRelation('skills', new Collection());

        $result = $service->calculateMatchForUserAndJob($user, $job);

        $this->assertSame(67, $result['percentage']);
        $this->assertSame('skills_required', $result['source']);
        $this->assertCount(2, $result['matched_skills']);
        $this->assertCount(1, $result['missing_skills']);
        $this->assertSame(['TypeScript'], $result['suggested_skills']);
    }

    private function makeUserSkill(int $id, string $name): Skill
    {
        $skill = new Skill();
        $skill->id = $id;
        $skill->name = $name;

        return $skill;
    }

    private function makeJobSkill(int $id, string $name, string $importance): Skill
    {
        $skill = new Skill();
        $skill->id = $id;
        $skill->name = $name;
        $skill->pivot = (object) [
            'importance' => $importance,
        ];

        return $skill;
    }
}
