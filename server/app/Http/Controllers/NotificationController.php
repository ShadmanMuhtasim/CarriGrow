<?php

namespace App\Http\Controllers;

use App\Models\UserNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\StreamedResponse;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = auth('api')->user();

        $validator = Validator::make($request->all(), [
            'status' => ['sometimes', Rule::in(['all', 'unread', 'read'])],
            'per_page' => ['sometimes', 'integer', Rule::in([10, 25, 50])],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $validated = $validator->validated();
        $perPage = (int) ($validated['per_page'] ?? 10);
        $status = $validated['status'] ?? 'all';

        $query = UserNotification::query()
            ->where('user_id', $user->id)
            ->with([
                'actor:id,name,role',
                'post:id,title,type',
                'reply:id,post_id,content',
            ])
            ->orderByRaw('read_at IS NULL DESC')
            ->orderByDesc('created_at')
            ->orderByDesc('id');

        if ($status === 'unread') {
            $query->whereNull('read_at');
        } elseif ($status === 'read') {
            $query->whereNotNull('read_at');
        }

        $notifications = $query->paginate($perPage)->appends($validated);

        return response()->json([
            'data' => $notifications->items(),
            'current_page' => $notifications->currentPage(),
            'last_page' => $notifications->lastPage(),
            'per_page' => $notifications->perPage(),
            'total' => $notifications->total(),
            'unread_count' => $this->unreadCountForUser($user->id),
        ]);
    }

    public function stream(Request $request): StreamedResponse
    {
        $user = auth('api')->user();
        $userId = (int) $user->id;
        $lastSeenId = max(
            (int) $request->query('last_id', 0),
            (int) $request->header('Last-Event-ID', 0)
        );

        $response = response()->stream(function () use ($userId, $lastSeenId) {
            ignore_user_abort(true);
            @set_time_limit(0);
            @ini_set('zlib.output_compression', '0');
            @ini_set('output_buffering', 'off');

            while (ob_get_level() > 0) {
                @ob_end_flush();
            }

            echo "retry: 3000\n";
            echo "\n";
            $this->flushStream();

            $currentLastSeenId = $lastSeenId;
            $knownUnreadCount = $this->unreadCountForUser($userId);

            $this->writeStreamEvent('connected', [
                'unread_count' => $knownUnreadCount,
            ]);

            $startedAt = microtime(true);

            while (!connection_aborted() && (microtime(true) - $startedAt) < 55) {
                $newNotifications = UserNotification::query()
                    ->where('user_id', $userId)
                    ->where('id', '>', $currentLastSeenId)
                    ->with([
                        'actor:id,name,role',
                        'post:id,title,type',
                        'reply:id,post_id,content',
                    ])
                    ->orderBy('id')
                    ->limit(20)
                    ->get();

                foreach ($newNotifications as $notification) {
                    $currentLastSeenId = max($currentLastSeenId, (int) $notification->id);
                    $knownUnreadCount = $this->unreadCountForUser($userId);

                    $this->writeStreamEvent('notification.created', [
                        'notification' => $notification,
                        'unread_count' => $knownUnreadCount,
                    ], (string) $notification->id);
                }

                $latestUnreadCount = $this->unreadCountForUser($userId);
                if ($latestUnreadCount !== $knownUnreadCount) {
                    $knownUnreadCount = $latestUnreadCount;

                    $this->writeStreamEvent('notifications.unread_count', [
                        'unread_count' => $knownUnreadCount,
                    ]);
                }

                $this->writeStreamEvent('ping', [
                    'time' => now()->toIso8601String(),
                ]);

                sleep(3);
            }

            $this->writeStreamEvent('stream.end', [
                'reconnect' => true,
            ]);
        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache, no-transform',
            'Connection' => 'keep-alive',
            'X-Accel-Buffering' => 'no',
        ]);

        return $response;
    }

    public function read(UserNotification $notification): JsonResponse
    {
        $user = auth('api')->user();
        $guardResponse = $this->ensureOwnsNotification($user->id, $notification);

        if ($guardResponse !== null) {
            return $guardResponse;
        }

        if ($notification->read_at === null) {
            $notification->read_at = now();
            $notification->save();
        }

        $notification->load([
            'actor:id,name,role',
            'post:id,title,type',
            'reply:id,post_id,content',
        ]);

        return response()->json([
            'message' => 'Notification marked as read',
            'notification' => $notification,
            'unread_count' => $this->unreadCountForUser($user->id),
        ]);
    }

    public function readAll(): JsonResponse
    {
        $user = auth('api')->user();

        $updatedCount = UserNotification::query()
            ->where('user_id', $user->id)
            ->whereNull('read_at')
            ->update([
                'read_at' => now(),
                'updated_at' => now(),
            ]);

        return response()->json([
            'message' => 'All notifications marked as read',
            'updated_count' => $updatedCount,
            'unread_count' => 0,
        ]);
    }

    private function ensureOwnsNotification(int $userId, UserNotification $notification): ?JsonResponse
    {
        if ($notification->user_id !== $userId) {
            return response()->json([
                'message' => 'You are not allowed to manage this notification',
            ], 403);
        }

        return null;
    }

    private function unreadCountForUser(int $userId): int
    {
        return UserNotification::query()
            ->where('user_id', $userId)
            ->whereNull('read_at')
            ->count();
    }

    private function writeStreamEvent(string $event, array $payload, ?string $id = null): void
    {
        if ($id !== null) {
            echo 'id: ' . $id . "\n";
        }

        echo 'event: ' . $event . "\n";
        echo 'data: ' . json_encode($payload, JSON_UNESCAPED_SLASHES) . "\n";
        echo "\n";

        $this->flushStream();
    }

    private function flushStream(): void
    {
        if (function_exists('ob_flush') && ob_get_level() > 0) {
            @ob_flush();
        }

        flush();
    }
}
