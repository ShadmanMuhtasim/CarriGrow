<?php

namespace App\Services;

use App\Models\ForumPost;
use App\Models\Job;
use App\Models\JobApplication;
use App\Models\User;
use Carbon\Carbon;

class AdminMetricsService
{
    public function summary(): array
    {
        return [
            'users' => User::query()->count(),
            'jobs' => Job::query()->count(),
            'applications' => JobApplication::query()->count(),
            'forumPosts' => ForumPost::query()->count(),
        ];
    }

    public function growth(int $months = 6): array
    {
        $months = max(1, $months);
        $start = now()->startOfMonth()->subMonths($months - 1);

        $users = $this->countsByMonth(User::query(), $start);
        $jobs = $this->countsByMonth(Job::query(), $start);
        $applications = $this->countsByMonth(JobApplication::query(), $start);

        $points = [];
        for ($offset = 0; $offset < $months; $offset++) {
            $month = $start->copy()->addMonths($offset);
            $bucket = $month->format('Y-m');

            $points[] = [
                'label' => $month->format('M'),
                'users' => (int) ($users[$bucket] ?? 0),
                'jobs' => (int) ($jobs[$bucket] ?? 0),
                'applications' => (int) ($applications[$bucket] ?? 0),
            ];
        }

        return $points;
    }

    private function countsByMonth($query, Carbon $start): array
    {
        return $query
            ->where('created_at', '>=', $start)
            ->selectRaw("DATE_FORMAT(created_at, '%Y-%m') as bucket, COUNT(*) as aggregate")
            ->groupBy('bucket')
            ->pluck('aggregate', 'bucket')
            ->map(fn ($count) => (int) $count)
            ->all();
    }
}
