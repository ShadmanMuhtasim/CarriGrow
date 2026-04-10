<?php

namespace App\Http\Controllers;

use App\Models\AdminAction;
use App\Models\User;
use App\Services\AdminAuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class AdminUserController extends Controller
{
    public function __construct(private readonly AdminAuditService $audit)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'search' => ['sometimes', 'nullable', 'string', 'max:255'],
            'role' => ['sometimes', Rule::in(['all', User::ROLE_JOB_SEEKER, User::ROLE_EMPLOYER, User::ROLE_MENTOR, User::ROLE_ADMIN])],
            'status' => ['sometimes', Rule::in(['all', User::STATUS_ACTIVE, User::STATUS_BANNED])],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $validated = $validator->validated();

        $query = User::query()
            ->with(['skills:id,name'])
            ->orderBy('name')
            ->orderBy('id');

        if (!empty($validated['search'])) {
            $search = trim((string) $validated['search']);
            $query->where(function ($builder) use ($search) {
                $builder->where('name', 'like', '%' . $search . '%')
                    ->orWhere('email', 'like', '%' . $search . '%');
            });
        }

        if (!empty($validated['role']) && $validated['role'] !== 'all') {
            $query->where('role', $validated['role']);
        }

        if (!empty($validated['status']) && $validated['status'] !== 'all') {
            $query->where('status', $validated['status']);
        }

        return response()->json([
            'users' => $query->get(),
        ]);
    }

    public function show(User $user): JsonResponse
    {
        $user->load([
            'skills:id,name,category',
            'jobSeekerProfile',
            'employerProfile',
            'mentorProfile',
        ]);

        return response()->json([
            'user' => $user,
        ]);
    }

    public function updateRole(Request $request, User $user): JsonResponse
    {
        $admin = auth('api')->user();

        $validator = Validator::make($request->all(), [
            'role' => ['required', Rule::in([
                User::ROLE_JOB_SEEKER,
                User::ROLE_EMPLOYER,
                User::ROLE_MENTOR,
                User::ROLE_ADMIN,
            ])],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $nextRole = $validator->validated()['role'];
        $guardResponse = $this->ensureRoleChangeAllowed($user, $nextRole);

        if ($guardResponse !== null) {
            return $guardResponse;
        }

        $user->role = $nextRole;
        $user->save();
        $user->load(['skills:id,name,category', 'jobSeekerProfile', 'employerProfile', 'mentorProfile']);

        $this->audit->record(
            $admin,
            AdminAction::ACTION_USER_ROLE_CHANGED,
            AdminAction::TARGET_USER,
            (int) $user->id,
            'role:' . $nextRole
        );

        return response()->json([
            'message' => 'User role updated successfully',
            'user' => $user,
        ]);
    }

    public function updateStatus(Request $request, User $user): JsonResponse
    {
        $admin = auth('api')->user();

        $validator = Validator::make($request->all(), [
            'status' => ['sometimes', Rule::in([User::STATUS_ACTIVE, User::STATUS_BANNED])],
            'reason' => ['sometimes', 'nullable', 'string', 'max:500'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $validated = $validator->validated();
        $nextStatus = $validated['status'] ?? ($user->status === User::STATUS_ACTIVE ? User::STATUS_BANNED : User::STATUS_ACTIVE);

        return $this->persistStatus($admin, $user, $nextStatus, $validated['reason'] ?? null);
    }

    public function suspend(Request $request, User $user): JsonResponse
    {
        $admin = auth('api')->user();
        $reason = $request->input('reason');

        return $this->persistStatus($admin, $user, User::STATUS_BANNED, is_string($reason) ? $reason : null);
    }

    public function activate(Request $request, User $user): JsonResponse
    {
        $admin = auth('api')->user();
        $reason = $request->input('reason');

        return $this->persistStatus($admin, $user, User::STATUS_ACTIVE, is_string($reason) ? $reason : null);
    }

    private function persistStatus(User $admin, User $user, string $nextStatus, ?string $reason = null): JsonResponse
    {
        $guardResponse = $this->ensureStatusChangeAllowed($admin, $user, $nextStatus);

        if ($guardResponse !== null) {
            return $guardResponse;
        }

        $user->status = $nextStatus;
        $user->save();
        $user->load(['skills:id,name,category', 'jobSeekerProfile', 'employerProfile', 'mentorProfile']);

        $this->audit->record(
            $admin,
            AdminAction::ACTION_USER_STATUS_CHANGED,
            AdminAction::TARGET_USER,
            (int) $user->id,
            trim(implode(' ', array_filter([
                'status:' . $nextStatus,
                $reason ? 'reason:' . $reason : null,
            ])))
        );

        return response()->json([
            'message' => 'User status updated successfully',
            'user' => $user,
        ]);
    }

    private function ensureRoleChangeAllowed(User $user, string $nextRole): ?JsonResponse
    {
        if ($user->role === $nextRole) {
            return null;
        }

        if ($nextRole === User::ROLE_ADMIN) {
            $adminCount = User::query()->where('role', User::ROLE_ADMIN)->count();
            if ($adminCount >= 4) {
                return response()->json([
                    'message' => 'Admin role limit reached',
                ], 422);
            }
        }

        if ($user->role === User::ROLE_ADMIN && $nextRole !== User::ROLE_ADMIN) {
            $adminCount = User::query()->where('role', User::ROLE_ADMIN)->count();
            if ($adminCount <= 1) {
                return response()->json([
                    'message' => 'At least one admin account is required',
                ], 422);
            }
        }

        return null;
    }

    private function ensureStatusChangeAllowed(User $admin, User $user, string $nextStatus): ?JsonResponse
    {
        if ($user->id === $admin->id && $nextStatus === User::STATUS_BANNED) {
            return response()->json([
                'message' => 'You cannot suspend your own account',
            ], 422);
        }

        if (
            $user->role === User::ROLE_ADMIN
            && $user->status === User::STATUS_ACTIVE
            && $nextStatus === User::STATUS_BANNED
        ) {
            $activeAdminCount = User::query()
                ->where('role', User::ROLE_ADMIN)
                ->where('status', User::STATUS_ACTIVE)
                ->count();

            if ($activeAdminCount <= 1) {
                return response()->json([
                    'message' => 'At least one active admin account is required',
                ], 422);
            }
        }

        return null;
    }
}
