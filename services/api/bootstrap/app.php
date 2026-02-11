<?php

use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'permission' => \App\Http\Middleware\RequirePermission::class,
            'branch_scope' => \App\Http\Middleware\EnforceBranchScope::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (Throwable $e, Request $request) {
            if ($request->is('api/*')) {
                if ($e instanceof AuthenticationException) {
                    return response()->json([
                        'error' => [
                            'code' => 'UNAUTHORIZED',
                            'message' => 'Unauthenticated.',
                            'details' => null,
                        ]
                    ], 401);
                }

                if ($e instanceof AccessDeniedHttpException) {
                    // Customize message if exception has one, otherwise default
                    $message = $e->getMessage() ?: 'You do not have permission to perform this action.';

                    return response()->json([
                        'error' => [
                            'code' => 'FORBIDDEN',
                            'message' => $message,
                            'details' => null,
                        ]
                    ], 403);
                }

                if ($e instanceof NotFoundHttpException) {
                    return response()->json([
                        'error' => [
                            'code' => 'NOT_FOUND',
                            'message' => 'Resource not found.',
                            'details' => null,
                        ]
                    ], 404);
                }

                if ($e instanceof ValidationException) {
                    return response()->json([
                        'error' => [
                            'code' => 'VALIDATION_ERROR',
                            'message' => 'Validation failed.',
                            'details' => $e->errors(),
                        ]
                    ], 422);
                }
            }
        });
    })->create();
