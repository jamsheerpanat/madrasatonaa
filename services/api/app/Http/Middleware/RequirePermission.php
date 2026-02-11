<?php

namespace App\Http\Middleware;

use App\Helpers\AuthContext;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class RequirePermission
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        if (!AuthContext::user()) {
            // Should ideally be caught by auth middleware before this
            abort(401, 'Unauthenticated.');
        }

        if (!AuthContext::hasPermission($permission)) {
            throw new AccessDeniedHttpException();
        }

        return $next($request);
    }
}
