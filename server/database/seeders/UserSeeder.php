<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run()
    {
        // ---- Create exactly 4 admins ----
        $admins = [
            ['name' => 'Admin 1', 'email' => 'admin1@carrigrow.com'],
            ['name' => 'Admin 2', 'email' => 'admin2@carrigrow.com'],
            ['name' => 'Admin 3', 'email' => 'admin3@carrigrow.com'],
            ['name' => 'Admin 4', 'email' => 'admin4@carrigrow.com'],
        ];

        foreach ($admins as $a) {
            User::updateOrCreate(
                ['email' => $a['email']],
                [
                    'name' => $a['name'],
                    'password' => Hash::make('password'),
                    'role' => User::ROLE_ADMIN,
                    'status' => User::STATUS_ACTIVE,
                ]
            );
        }

        // ---- Sample employer ----
        User::updateOrCreate(
            ['email' => 'employer@carrigrow.com'],
            [
                'name' => 'Sample Employer',
                'password' => Hash::make('password'),
                'role' => User::ROLE_EMPLOYER,
                'status' => User::STATUS_ACTIVE,
            ]
        );

        // ---- Sample mentor ----
        User::updateOrCreate(
            ['email' => 'mentor@carrigrow.com'],
            [
                'name' => 'Sample Mentor',
                'password' => Hash::make('password'),
                'role' => User::ROLE_MENTOR,
                'status' => User::STATUS_ACTIVE,
            ]
        );

        // ---- Sample job seeker ----
        User::updateOrCreate(
            ['email' => 'jobseeker@carrigrow.com'],
            [
                'name' => 'Sample Job Seeker',
                'password' => Hash::make('password'),
                'role' => User::ROLE_JOB_SEEKER,
                'status' => User::STATUS_ACTIVE,
            ]
        );
    }
}