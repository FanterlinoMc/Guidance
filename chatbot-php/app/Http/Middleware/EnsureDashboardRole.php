<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

// Ported from src/features/dashboard-auth/logic/roles.ts's DashboardRole gate. No per-role
// permission matrix exists in the original codebase (its own comment: "no permission matrix...
// yet" -- that needs a chosen auth provider and a real dashboard to define requirements against,
// neither of which existed at the time). So this only checks "authenticated AND has any role
// assigned", not which specific one -- any of concierge/ae/rm/dm/admin can access everything.
class EnsureDashboardRole
{
    public function handle(Request $request, Closure $next)
    {
        $user = Auth::user();
        if ($user === null) {
            return redirect()->route('login');
        }

        // Authenticated but no role assigned: a 403, not a redirect back to login -- looping an
        // already-logged-in user back to the login form is a dead end, not a fix.
        if ($user->role === null) {
            abort(403, 'Your account has no dashboard role assigned.');
        }

        return $next($request);
    }
}
