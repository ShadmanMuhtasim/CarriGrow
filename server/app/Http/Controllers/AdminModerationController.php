<?php

namespace App\Http\Controllers;

use App\Models\AdminAction;
use App\Models\ContentReport;
use App\Models\ForumPost;
use App\Models\ForumReply;
use App\Services\AdminAuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AdminModerationController extends Controller
{
    public function __construct(private readonly AdminAuditService $audit)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'status' => ['sometimes', Rule::in([
                'all',
                ContentReport::STATUS_PENDING,
                ContentReport::STATUS_APPROVED,
                ContentReport::STATUS_REMOVED,
            ])],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $status = $validator->validated()['status'] ?? ContentReport::STATUS_PENDING;

        $query = ContentReport::query()
            ->with(['reporter:id,name'])
            ->orderByRaw('status = ? DESC', [ContentReport::STATUS_PENDING])
            ->orderByDesc('created_at')
            ->orderByDesc('id');

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        $reports = $query->get();

        return response()->json([
            'items' => $this->mapReports($reports),
        ]);
    }

    public function resolve(Request $request, ContentReport $report): JsonResponse
    {
        $admin = auth('api')->user();

        $validator = Validator::make($request->all(), [
            'action' => ['required', Rule::in(['approve', 'remove'])],
            'reason' => ['sometimes', 'nullable', 'string', 'max:500'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $validated = $validator->validated();
        $action = $validated['action'];
        $nextStatus = $action === 'approve' ? ContentReport::STATUS_APPROVED : ContentReport::STATUS_REMOVED;

        if ($action === 'remove') {
            $this->removeContent($report);
        } else {
            $this->approveContent($report);
        }

        $report->status = $nextStatus;
        $report->reviewed_by = $admin->id;
        $report->reviewed_at = now();
        $report->save();
        $report->load('reporter:id,name');

        $this->audit->record(
            $admin,
            $action === 'approve' ? AdminAction::ACTION_CONTENT_APPROVED : AdminAction::ACTION_CONTENT_REMOVED,
            AdminAction::TARGET_CONTENT_REPORT,
            (int) $report->id,
            trim(implode(' ', array_filter([
                'content:' . $report->content_type . '#' . $report->content_id,
                !empty($validated['reason']) ? 'reason:' . $validated['reason'] : null,
            ])))
        );

        return response()->json([
            'message' => 'Moderation item updated successfully',
            'item' => $this->mapReports(collect([$report]))[0],
        ]);
    }

    private function mapReports($reports): array
    {
        $postIds = $reports
            ->where('content_type', ContentReport::TYPE_FORUM_POST)
            ->pluck('content_id')
            ->map(fn ($id) => (int) $id)
            ->unique()
            ->values()
            ->all();

        $replyIds = $reports
            ->where('content_type', ContentReport::TYPE_FORUM_REPLY)
            ->pluck('content_id')
            ->map(fn ($id) => (int) $id)
            ->unique()
            ->values()
            ->all();

        $posts = ForumPost::withTrashed()
            ->with('user:id,name')
            ->whereIn('id', $postIds)
            ->get()
            ->keyBy('id');

        $replies = ForumReply::query()
            ->with(['user:id,name', 'post:id,title'])
            ->whereIn('id', $replyIds)
            ->get()
            ->keyBy('id');

        return $reports->map(function (ContentReport $report) use ($posts, $replies) {
            $target = $report->content_type === ContentReport::TYPE_FORUM_POST
                ? $posts->get((int) $report->content_id)
                : $replies->get((int) $report->content_id);

            return [
                'id' => (int) $report->id,
                'content_type' => $report->content_type,
                'content_id' => (int) $report->content_id,
                'reason' => $report->reason,
                'excerpt' => $this->excerptForTarget($target, $report->content_type),
                'reported_by' => $report->reporter?->name ?? ($report->reported_by ? 'User #' . $report->reported_by : 'System'),
                'status' => $report->status,
                'created_at' => optional($report->created_at)->toIso8601String(),
            ];
        })->values()->all();
    }

    private function excerptForTarget(mixed $target, string $contentType): string
    {
        if (!$target) {
            return 'Content is no longer available.';
        }

        if ($contentType === ContentReport::TYPE_FORUM_POST) {
            $content = trim(implode(' ', array_filter([
                $target->title ?? null,
                strip_tags((string) ($target->content ?? '')),
            ])));

            return Str::limit(preg_replace('/\s+/', ' ', $content) ?? $content, 160);
        }

        $content = strip_tags((string) ($target->content ?? ''));
        $normalized = preg_replace('/\s+/', ' ', trim($content)) ?? trim($content);

        return Str::limit($normalized, 160);
    }

    private function approveContent(ContentReport $report): void
    {
        if ($report->content_type === ContentReport::TYPE_FORUM_POST) {
            $post = ForumPost::withTrashed()->find($report->content_id);
            if ($post && $post->status === ForumPost::STATUS_HIDDEN) {
                $post->status = ForumPost::STATUS_PUBLISHED;
                $post->save();
            }
        }
    }

    private function removeContent(ContentReport $report): void
    {
        if ($report->content_type === ContentReport::TYPE_FORUM_POST) {
            $post = ForumPost::withTrashed()->find($report->content_id);
            if ($post && $post->status !== ForumPost::STATUS_DELETED) {
                $post->status = ForumPost::STATUS_HIDDEN;
                $post->save();
            }

            return;
        }

        $reply = ForumReply::query()->find($report->content_id);
        if (!$reply) {
            return;
        }

        $post = $reply->post;
        $reply->delete();

        if ($post) {
            ForumPostController::syncPostMeta($post);
        }
    }
}
