<?php

namespace App\Http\Controllers;

use App\Models\AdminAction;
use App\Models\AdminReport;
use App\Services\AdminAuditService;
use App\Services\AdminMetricsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class AdminReportController extends Controller
{
    public function __construct(
        private readonly AdminAuditService $audit,
        private readonly AdminMetricsService $metrics
    ) {
    }

    public function index(): JsonResponse
    {
        return response()->json([
            'reports' => AdminReport::query()
                ->orderByDesc('generated_at')
                ->orderByDesc('id')
                ->get(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $admin = auth('api')->user();

        $validator = Validator::make($request->all(), [
            'type' => ['required', Rule::in([
                AdminReport::TYPE_WEEKLY,
                AdminReport::TYPE_MONTHLY,
                AdminReport::TYPE_CUSTOM,
            ])],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $type = $validator->validated()['type'];
        $report = AdminReport::query()->create([
            'title' => $this->reportTitle($type),
            'type' => $type,
            'status' => AdminReport::STATUS_READY,
            'generated_by' => $admin->id,
            'generated_at' => now(),
            'payload' => [
                'summary' => $this->metrics->summary(),
                'growth' => $this->metrics->growth(),
            ],
        ]);

        $this->audit->record(
            $admin,
            AdminAction::ACTION_REPORT_GENERATED,
            AdminAction::TARGET_ADMIN_REPORT,
            (int) $report->id,
            'type:' . $type
        );

        return response()->json([
            'message' => 'Admin report generated successfully',
            'report' => $report,
        ], 201);
    }

    private function reportTitle(string $type): string
    {
        $dateLabel = now()->format('M d, Y');

        return match ($type) {
            AdminReport::TYPE_WEEKLY => 'Weekly Platform Snapshot - ' . $dateLabel,
            AdminReport::TYPE_MONTHLY => 'Monthly Platform Summary - ' . $dateLabel,
            default => 'Custom Admin Report - ' . $dateLabel,
        };
    }
}
