<?php

namespace App\Http\Controllers;

use App\Models\ForumPost;
use App\Models\ForumReply;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ForumReplyController extends Controller
{
    public function store(Request $request, ForumPost $post): JsonResponse
    {
        $user = auth('api')->user();
        $guardResponse = $this->ensureCanReply($user, $post);

        if ($guardResponse !== null) {
            return $guardResponse;
        }

        $validator = Validator::make($request->all(), [
            'content' => ['required', 'string'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $reply = ForumReply::query()->create([
            'post_id' => $post->id,
            'user_id' => $user->id,
            'content' => $validator->validated()['content'],
            'is_solution' => false,
        ]);

        ForumPostController::syncPostMeta($post);
        $reply->load('user:id,name');

        return response()->json([
            'message' => 'Forum reply created successfully',
            'reply' => $reply,
        ], 201);
    }

    public function update(Request $request, ForumReply $reply): JsonResponse
    {
        $user = auth('api')->user();
        $guardResponse = $this->ensureCanManageReply($user, $reply);

        if ($guardResponse !== null) {
            return $guardResponse;
        }

        $validator = Validator::make($request->all(), [
            'content' => ['required', 'string'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $reply->content = $validator->validated()['content'];
        $reply->save();
        $reply->load('user:id,name');

        return response()->json([
            'message' => 'Forum reply updated successfully',
            'reply' => $reply,
        ]);
    }

    public function destroy(ForumReply $reply): JsonResponse
    {
        $user = auth('api')->user();
        $guardResponse = $this->ensureCanManageReply($user, $reply);

        if ($guardResponse !== null) {
            return $guardResponse;
        }

        $post = $reply->post;
        $reply->delete();

        if ($post) {
            ForumPostController::syncPostMeta($post);
        }

        return response()->json([
            'message' => 'Forum reply deleted successfully',
        ]);
    }

    public function markSolution(ForumReply $reply): JsonResponse
    {
        $user = auth('api')->user();
        $reply->loadMissing('post');
        $guardResponse = $this->ensureCanMarkSolution($user, $reply);

        if ($guardResponse !== null) {
            return $guardResponse;
        }

        $post = $reply->post;

        if (!$post || $post->status !== ForumPost::STATUS_PUBLISHED) {
            return response()->json([
                'message' => 'Forum post not found',
            ], 404);
        }

        $post->replies()->update(['is_solution' => false]);
        $reply->is_solution = true;
        $reply->save();

        ForumPostController::syncPostMeta($post);
        $reply->load('user:id,name');

        return response()->json([
            'message' => 'Forum reply marked as solution successfully',
            'reply' => $reply,
        ]);
    }

    private function ensureCanReply(?User $user, ForumPost $post): ?JsonResponse
    {
        if (!$user) {
            return response()->json([
                'message' => 'Authentication required',
            ], 401);
        }

        if ($user->status !== User::STATUS_ACTIVE) {
            return response()->json([
                'message' => 'Only active users can participate in the forum',
            ], 403);
        }

        if ($post->status !== ForumPost::STATUS_PUBLISHED) {
            return response()->json([
                'message' => 'You can only reply to published forum posts',
            ], 422);
        }

        return null;
    }

    private function ensureCanManageReply(?User $user, ForumReply $reply): ?JsonResponse
    {
        if (!$user) {
            return response()->json([
                'message' => 'Authentication required',
            ], 401);
        }

        if ($user->status !== User::STATUS_ACTIVE) {
            return response()->json([
                'message' => 'Only active users can participate in the forum',
            ], 403);
        }

        if ($reply->user_id !== $user->id && !ForumPostController::canModerateForum($user)) {
            return response()->json([
                'message' => 'You are not allowed to manage this forum reply',
            ], 403);
        }

        return null;
    }

    private function ensureCanMarkSolution(?User $user, ForumReply $reply): ?JsonResponse
    {
        if (!$user) {
            return response()->json([
                'message' => 'Authentication required',
            ], 401);
        }

        if ($user->status !== User::STATUS_ACTIVE) {
            return response()->json([
                'message' => 'Only active users can participate in the forum',
            ], 403);
        }

        $post = $reply->post;
        if (!$post) {
            return response()->json([
                'message' => 'Forum post not found',
            ], 404);
        }

        if ($reply->post_id !== $post->id) {
            return response()->json([
                'message' => 'Forum post not found',
            ], 404);
        }

        if ($post->user_id !== $user->id && !ForumPostController::canModerateForum($user)) {
            return response()->json([
                'message' => 'You are not allowed to mark a solution for this forum post',
            ], 403);
        }

        return null;
    }
}
