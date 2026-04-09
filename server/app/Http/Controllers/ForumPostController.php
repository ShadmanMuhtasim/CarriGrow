<?php

namespace App\Http\Controllers;

use App\Models\ForumPost;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class ForumPostController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'search' => ['sometimes', 'nullable', 'string', 'max:255'],
            'skill_id' => ['sometimes', 'integer', 'exists:skills,id'],
            'type' => ['sometimes', Rule::in($this->typeValues())],
            'date' => ['sometimes', 'date'],
            'date_from' => ['sometimes', 'date'],
            'date_to' => ['sometimes', 'date', 'after_or_equal:date_from'],
            'sort' => ['sometimes', Rule::in(['popular', 'recent', 'unanswered'])],
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

        $query = ForumPost::query()
            ->where('status', ForumPost::STATUS_PUBLISHED)
            ->with([
                'user:id,name',
                'skills:id,name,category',
            ]);

        if (!empty($validated['search'])) {
            $search = trim((string) $validated['search']);

            $query->where(function ($builder) use ($search) {
                $builder->where('title', 'like', '%' . $search . '%')
                    ->orWhere('content', 'like', '%' . $search . '%');
            });
        }

        if (!empty($validated['skill_id'])) {
            $skillId = (int) $validated['skill_id'];

            $query->whereHas('skills', function ($builder) use ($skillId) {
                $builder->where('skills.id', $skillId);
            });
        }

        if (!empty($validated['type'])) {
            $query->where('type', $validated['type']);
        }

        if (!empty($validated['date'])) {
            $query->whereDate('created_at', $validated['date']);
        }

        if (!empty($validated['date_from'])) {
            $query->whereDate('created_at', '>=', $validated['date_from']);
        }

        if (!empty($validated['date_to'])) {
            $query->whereDate('created_at', '<=', $validated['date_to']);
        }

        $sort = $validated['sort'] ?? 'recent';

        if ($sort === 'popular') {
            $query->orderByDesc('is_pinned')
                ->orderByDesc('views_count')
                ->orderByDesc('replies_count')
                ->orderByDesc('created_at');
        } elseif ($sort === 'unanswered') {
            $query->orderByDesc('is_pinned')
                ->orderBy('replies_count')
                ->orderByDesc('created_at');
        } else {
            $query->orderByDesc('is_pinned')
                ->orderByDesc('created_at')
                ->orderByDesc('id');
        }

        $posts = $query->paginate($perPage)->appends($validated);

        return response()->json($posts);
    }

    public function store(Request $request): JsonResponse
    {
        $user = auth('api')->user();
        $guardResponse = $this->ensureAuthenticatedActiveUser($user);

        if ($guardResponse !== null) {
            return $guardResponse;
        }

        $validator = Validator::make($request->all(), [
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string'],
            'type' => ['required', Rule::in($this->typeValues())],
            'skill_ids' => ['sometimes', 'nullable', 'array'],
            'skill_ids.*' => ['integer', 'distinct', 'exists:skills,id'],
            'is_pinned' => ['sometimes', 'boolean'],
            'status' => ['sometimes', Rule::in($this->manageableStatusValues())],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $validated = $validator->validated();

        $post = new ForumPost([
            'title' => $validated['title'],
            'content' => $validated['content'],
            'type' => $validated['type'],
            'views_count' => 0,
            'replies_count' => 0,
            'is_solved' => false,
            'is_pinned' => $this->canModerateForum($user) ? (bool) ($validated['is_pinned'] ?? false) : false,
            'status' => $this->canModerateForum($user)
                ? ($validated['status'] ?? ForumPost::STATUS_PUBLISHED)
                : ForumPost::STATUS_PUBLISHED,
        ]);
        $post->user_id = $user->id;
        $post->save();

        $post->skills()->sync($validated['skill_ids'] ?? []);
        $post->load($this->postRelations());

        return response()->json([
            'message' => 'Forum post created successfully',
            'post' => $post,
        ], 201);
    }

    public function show(ForumPost $post): JsonResponse
    {
        if ($post->status !== ForumPost::STATUS_PUBLISHED) {
            return response()->json([
                'message' => 'Forum post not found',
            ], 404);
        }

        $post->increment('views_count');
        $post->load($this->postRelations());

        return response()->json([
            'post' => $post,
        ]);
    }

    public function update(Request $request, ForumPost $post): JsonResponse
    {
        $user = auth('api')->user();
        $guardResponse = $this->ensureCanManagePost($user, $post);

        if ($guardResponse !== null) {
            return $guardResponse;
        }

        $validator = Validator::make($request->all(), [
            'title' => ['sometimes', 'string', 'max:255'],
            'content' => ['sometimes', 'string'],
            'type' => ['sometimes', Rule::in($this->typeValues())],
            'skill_ids' => ['sometimes', 'nullable', 'array'],
            'skill_ids.*' => ['integer', 'distinct', 'exists:skills,id'],
            'is_pinned' => ['sometimes', 'boolean'],
            'status' => ['sometimes', Rule::in($this->manageableStatusValues())],
            'is_solved' => ['sometimes', 'boolean'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $validated = $validator->validated();

        $fillable = array_intersect_key($validated, array_flip([
            'title',
            'content',
            'type',
            'is_solved',
        ]));

        if ($this->canModerateForum($user)) {
            if (array_key_exists('is_pinned', $validated)) {
                $fillable['is_pinned'] = (bool) $validated['is_pinned'];
            }

            if (array_key_exists('status', $validated)) {
                $fillable['status'] = $validated['status'];
            }
        }

        $post->fill($fillable);
        $post->save();

        if (array_key_exists('skill_ids', $validated)) {
            $post->skills()->sync($validated['skill_ids'] ?? []);
        }

        $this->syncPostMeta($post);
        $post->load($this->postRelations());

        return response()->json([
            'message' => 'Forum post updated successfully',
            'post' => $post,
        ]);
    }

    public function destroy(ForumPost $post): JsonResponse
    {
        $user = auth('api')->user();
        $guardResponse = $this->ensureCanManagePost($user, $post);

        if ($guardResponse !== null) {
            return $guardResponse;
        }

        $post->status = ForumPost::STATUS_DELETED;
        $post->save();
        $post->delete();

        return response()->json([
            'message' => 'Forum post deleted successfully',
        ]);
    }

    public static function syncPostMeta(ForumPost $post): ForumPost
    {
        $replyCount = $post->replies()->count();
        $isSolved = $post->replies()->where('is_solution', true)->exists();

        $post->forceFill([
            'replies_count' => $replyCount,
            'is_solved' => $isSolved,
        ])->save();

        return $post->refresh();
    }

    public static function canModerateForum(?User $user): bool
    {
        if (!$user) {
            return false;
        }

        return in_array($user->role, [User::ROLE_ADMIN, User::ROLE_MENTOR], true);
    }

    private function postRelations(): array
    {
        return [
            'user:id,name',
            'skills:id,name,category',
            'solutionReply.user:id,name',
            'replies' => function ($query) {
                $query->with('user:id,name')
                    ->orderBy('is_solution', 'desc')
                    ->orderBy('created_at');
            },
        ];
    }

    private function typeValues(): array
    {
        return [
            ForumPost::TYPE_QUESTION,
            ForumPost::TYPE_DISCUSSION,
            ForumPost::TYPE_RESOURCE,
        ];
    }

    private function manageableStatusValues(): array
    {
        return [
            ForumPost::STATUS_PUBLISHED,
            ForumPost::STATUS_HIDDEN,
        ];
    }

    private function ensureAuthenticatedActiveUser(?User $user): ?JsonResponse
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

        return null;
    }

    private function ensureCanManagePost(?User $user, ForumPost $post): ?JsonResponse
    {
        $guardResponse = $this->ensureAuthenticatedActiveUser($user);

        if ($guardResponse !== null) {
            return $guardResponse;
        }

        if ($post->user_id !== $user->id && !self::canModerateForum($user)) {
            return response()->json([
                'message' => 'You are not allowed to manage this forum post',
            ], 403);
        }

        return null;
    }
}
