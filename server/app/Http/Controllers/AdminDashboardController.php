<?php

namespace App\Http\Controllers;

use App\Models\AdminAction;
use App\Services\AdminMetricsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class AdminDashboardController extends Controller
{
    public function __construct(private readonly AdminMetricsService $metrics)
    {
    }

    public function stats(): JsonResponse
    {
        $summary = $this->metrics->summary();

        return response()->json([
            'stats' => $summary,
            'summary' => $summary,
        ]);
    }

    public function summary(): JsonResponse
    {
        return response()->json([
            'summary' => $this->metrics->summary(),
        ]);
    }

    public function growth(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'months' => ['sometimes', 'integer', 'min:3', 'max:12'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $months = (int) ($validator->validated()['months'] ?? 6);

        return response()->json([
            'points' => $this->metrics->growth($months),
        ]);
    }

    public function systemLogs(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'search' => ['sometimes', 'nullable', 'string', 'max:255'],
            'level' => ['sometimes', Rule::in(['all', 'info', 'warning', 'error'])],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $validated = $validator->validated();
        $level = $validated['level'] ?? 'all';
        $search = strtolower(trim((string) ($validated['search'] ?? '')));

        $logs = collect()
            ->merge($this->adminActionLogs())
            ->merge($this->failedJobLogs())
            ->sortByDesc('created_at')
            ->values();

        if ($level !== 'all') {
            $logs = $logs->where('level', $level)->values();
        }

        if ($search !== '') {
            $logs = $logs->filter(function (array $log) use ($search) {
                $haystack = strtolower(implode(' ', [
                    $log['actor'],
                    $log['action'],
                    $log['target'],
                ]));

                return str_contains($haystack, $search);
            })->values();
        }

        return response()->json([
            'logs' => $logs->take(100)->all(),
        ]);
    }

    private function adminActionLogs()
    {
        return AdminAction::query()
            ->with('admin:id,name')
            ->orderByDesc('created_at')
            ->limit(100)
            ->get()
            ->map(function (AdminAction $action) {
                return [
                    'id' => (int) $action->id,
                    'level' => $this->levelForAdminAction($action),
                    'actor' => $action->admin?->name ? 'admin:' . $action->admin->name : 'admin:#' . $action->admin_id,
                    'action' => str_replace('_', ' ', (string) $action->action_type),
                    'target' => $action->target_type . ':' . $action->target_id . ($action->reason ? ' (' . $action->reason . ')' : ''),
                    'created_at' => optional($action->created_at)->toIso8601String(),
                ];
            });
    }

    private function failedJobLogs()
    {
        return DB::table('failed_jobs')
            ->select(['id', 'connection', 'queue', 'exception', 'failed_at'])
            ->orderByDesc('id')
            ->limit(25)
            ->get()
            ->map(function ($failedJob) {
                $createdAt = null;
                if (!empty($failedJob->failed_at)) {
                    $timestamp = strtotime((string) $failedJob->failed_at);
                    $createdAt = $timestamp !== false ? date(DATE_ATOM, $timestamp) : null;
                }

                return [
                    'id' => 100000 + (int) $failedJob->id,
                    'level' => 'error',
                    'actor' => 'system',
                    'action' => 'failed job',
                    'target' => trim(implode(' ', array_filter([
                        $failedJob->connection ? 'connection:' . $failedJob->connection : null,
                        $failedJob->queue ? 'queue:' . $failedJob->queue : null,
                    ]))),
                    'created_at' => $createdAt,
                ];
            });
    }

    private function levelForAdminAction(AdminAction $action): string
    {
        return match ($action->action_type) {
            AdminAction::ACTION_USER_STATUS_CHANGED,
            AdminAction::ACTION_CONTENT_REMOVED => 'warning',
            default => 'info',
        };
    }
}
