<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;

class EnsureAdmin
{
    public function handle(Request $request, Closure $next)
    {
        $user = auth('api')->user();

        if (!$user) {
            return response()->json([
                'message' => 'Authentication required',
            ], 401);
        }

        if ($user->role !== User::ROLE_ADMIN) {
            return response()->json([
                'message' => 'Admin access required',
            ], 403);
        }

        if ($user->status !== User::STATUS_ACTIVE) {
            return response()->json([
                'message' => 'Only active admin users can access this resource',
            ], 403);
        }

        return $next($request);
    }
}
