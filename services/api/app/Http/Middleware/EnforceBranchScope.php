<?php

namespace App\Http\Middleware;

use App\Helpers\AuthContext;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class EnforceBranchScope
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = AuthContext::user();

        if (!$user || AuthContext::isOfficeAdmin()) {
            return $next($request);
        }

        // Only enforce for STAFF
        if ($user->user_type !== 'STAFF') {
            return $next($request);
        }

        $allowedBranches = AuthContext::allowedBranchIds();
        // Detect target branch from route params
        $targetBranchId = $request->input('branch_id') ?: $request->route('branchId');

        // If it's a section-based route, find the branch through section -> grade -> branch
        $sectionId = $request->route('sectionId') ?: $request->route('section');
        if (!$targetBranchId && $sectionId) {
            $section = \App\Models\Section::with('grade.branch')->find($sectionId);
            if ($section) {
                $targetBranchId = $section->grade->branch_id;
            }
        }

        // If trying to access/modify something with a branch_id context
        if ($targetBranchId && !in_array($targetBranchId, $allowedBranches)) {
            throw new AccessDeniedHttpException("You do not have access to this branch (Branch ID: {$targetBranchId}).");
        }

        return $next($request);
    }
}
