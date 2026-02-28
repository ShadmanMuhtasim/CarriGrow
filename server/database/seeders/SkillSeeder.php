<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Skill;

class SkillSeeder extends Seeder
{
    public function run()
    {
        $skills = [
            'Laravel', 'React', 'MySQL', 'JavaScript', 'TypeScript',
            'HTML', 'CSS', 'Tailwind', 'Bootstrap', 'Git',
            'REST API', 'JWT', 'OOP', 'Problem Solving'
        ];

        foreach ($skills as $s) {
            Skill::firstOrCreate(['name' => $s]);
        }
    }
}