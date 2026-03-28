<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Throwable;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => ['required','string','max:255'],
            'email' => ['required','email','max:255','unique:users,email'],
            'password' => [
                'required',
                'string',
                'min:8',
                'regex:/[A-Z]/',
                'regex:/[a-z]/',
                'regex:/[0-9]/',
                'confirmed',
            ],
            'role' => ['nullable','in:job_seeker,employer,mentor,admin'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $role = $request->input('role', User::ROLE_JOB_SEEKER);

        // Enforce "only 4 admins"
        if ($role === User::ROLE_ADMIN) {
            $adminCount = User::where('role', User::ROLE_ADMIN)->count();
            if ($adminCount >= 4) {
                return response()->json([
                    'message' => 'Admin limit reached (max 4).'
                ], 403);
            }
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $role,
            'status' => User::STATUS_ACTIVE,
        ]);

        $this->createRoleProfile($user);

        // Create token immediately after register (optional but useful)
        $token = auth('api')->login($user);

        return $this->tokenResponse($token, 'Registered successfully', 201);
    }

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => ['required','email'],
            'password' => ['required','string'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $credentials = $request->only('email', 'password');

        if (! $token = auth('api')->attempt($credentials)) {
            return response()->json([
                'message' => 'Invalid credentials'
            ], 401);
        }

        $user = auth('api')->user();

        // Block banned users
        if ($user && $user->status === User::STATUS_BANNED) {
            auth('api')->logout();
            return response()->json([
                'message' => 'User is banned'
            ], 403);
        }

        return $this->tokenResponse($token, 'Login successful');
    }

    public function me()
    {
        $user = auth('api')->user();
        $user?->load(['jobSeekerProfile', 'employerProfile', 'mentorProfile', 'skills']);

        return response()->json([
            'user' => $user,
        ]);
    }

    public function logout(): JsonResponse
    {
        try {
            if (auth('api')->check()) {
                auth('api')->logout();
            }
        } catch (Throwable $exception) {
            // Intentionally ignored: on invalid/expired tokens we still clear cookie.
        }

        return response()->json([
            'message' => 'Logged out successfully'
        ])->withCookie($this->forgetAuthCookie());
    }

    public function refresh()
    {
        $token = auth('api')->refresh();

        return $this->tokenResponse($token, 'Token refreshed');
    }

    public function forgotPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => ['required', 'email'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $status = Password::sendResetLink($request->only('email'));
        if ($status !== Password::RESET_LINK_SENT) {
            return response()->json([
                'message' => __($status),
            ], 422);
        }

        return response()->json([
            'message' => __($status),
        ]);
    }

    public function resetPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'token' => ['required', 'string'],
            'email' => ['required', 'email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user) use ($request) {
                $user->forceFill([
                    'password' => Hash::make($request->input('password')),
                    'remember_token' => Str::random(60),
                ])->save();

                event(new PasswordReset($user));
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            return response()->json([
                'message' => __($status),
            ], 422);
        }

        return response()->json([
            'message' => __($status),
        ]);
    }

    private function tokenResponse(string $token, string $message, int $statusCode = 200): JsonResponse
    {
        $user = auth('api')->setToken($token)->user();
        $user?->load(['jobSeekerProfile', 'employerProfile', 'mentorProfile', 'skills']);

        return response()->json([
            'message' => $message,
            'user' => $user,
            'expires_in' => auth('api')->factory()->getTTL() * 60,
        ], $statusCode)->withCookie($this->authCookie($token));
    }

    private function authCookie(string $token)
    {
        $minutes = (int) auth('api')->factory()->getTTL();
        $cookieName = (string) config('jwt.cookie_name', 'carrigrow_token');
        $path = (string) config('jwt.cookie_path', '/');
        $domain = config('jwt.cookie_domain') ?: null;
        $secure = (bool) config('jwt.cookie_secure', false);
        $sameSite = strtolower((string) config('jwt.cookie_same_site', 'lax'));

        if (!in_array($sameSite, ['lax', 'strict', 'none'], true)) {
            $sameSite = 'lax';
        }

        return cookie(
            $cookieName,
            $token,
            $minutes,
            $path,
            $domain,
            $secure,
            true,
            false,
            $sameSite
        );
    }

    private function forgetAuthCookie()
    {
        $cookieName = (string) config('jwt.cookie_name', 'carrigrow_token');
        $path = (string) config('jwt.cookie_path', '/');
        $domain = config('jwt.cookie_domain') ?: null;

        return cookie()->forget($cookieName, $path, $domain);
    }

    private function createRoleProfile(User $user): void
    {
        if ($user->role === User::ROLE_JOB_SEEKER) {
            $user->jobSeekerProfile()->firstOrCreate(['user_id' => $user->id]);
            return;
        }

        if ($user->role === User::ROLE_EMPLOYER) {
            $user->employerProfile()->firstOrCreate(
                ['user_id' => $user->id],
                ['company_name' => $user->name . ' Company']
            );
            return;
        }

        if ($user->role === User::ROLE_MENTOR) {
            $user->mentorProfile()->firstOrCreate(['user_id' => $user->id]);
        }
    }
}
