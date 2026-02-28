<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => ['required','string','max:255'],
            'email' => ['required','email','max:255','unique:users,email'],
            'password' => ['required','string','min:6','confirmed'],
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

        // Create token immediately after register (optional but useful)
        $token = auth('api')->login($user);

        return response()->json([
            'message' => 'Registered successfully',
            'user' => $user,
            'access_token' => $token,
            'token_type' => 'bearer',
        ], 201);
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

        return response()->json([
            'message' => 'Login successful',
            'user' => $user,
            'access_token' => $token,
            'token_type' => 'bearer',
        ]);
    }

    public function me()
    {
        return response()->json([
            'user' => auth('api')->user()
        ]);
    }

    public function logout()
    {
        auth('api')->logout();

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }
}