<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class UseJwtFromCookie
{
    public function handle(Request $request, Closure $next)
    {
        if ($request->bearerToken()) {
            return $next($request);
        }

        $cookieName = (string) config('jwt.cookie_name', 'carrigrow_token');
        $tokenFromCookie = $request->cookie($cookieName);

        if (is_string($tokenFromCookie) && trim($tokenFromCookie) !== '') {
            $request->headers->set('Authorization', 'Bearer ' . $tokenFromCookie);
        }

        return $next($request);
    }
}

