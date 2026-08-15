<?php

namespace App\Services\Session;

use Illuminate\Http\Request;
use Illuminate\Support\Str;

final class SessionResolver
{
    private const COOKIE_NAME = 'gh_session_id';

    private const COOKIE_MAX_AGE_MINUTES = 60 * 24 * 30;

    /**
     * The server, not the client, is the source of truth for session identity: a client-supplied
     * sessionId would let any caller pick an arbitrary or copied ID on purpose. HttpOnly closes
     * that for the legitimate browser widget -- page JS can't read or set the cookie.
     *
     * KNOWN LIMITATION (ported from the TS original): this does NOT make the ID unforgeable in
     * general -- the cookie's value is trusted verbatim with no signature. Closing that needs an
     * HMAC-signed or server-validated ID, deferred the same as in the original codebase.
     *
     * @return array{sessionId: string, cookie: \Symfony\Component\HttpFoundation\Cookie|null}
     */
    public function resolve(Request $request): array
    {
        $existing = $request->cookie(self::COOKIE_NAME);
        if ($existing) {
            return ['sessionId' => $existing, 'cookie' => null];
        }

        $sessionId = (string) Str::uuid();
        $cookie = cookie(
            self::COOKIE_NAME,
            $sessionId,
            self::COOKIE_MAX_AGE_MINUTES,
            '/',
            null,
            app()->isProduction(),
            true,
            false,
            app()->isProduction() ? 'none' : 'lax'
        );

        return ['sessionId' => $sessionId, 'cookie' => $cookie];
    }
}
