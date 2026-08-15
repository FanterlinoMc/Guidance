<?php

namespace App\Http\Middleware;

use Illuminate\Http\Middleware\TrustProxies as Middleware;
use Illuminate\Http\Request;

class TrustProxies extends Middleware
{
    /**
     * The trusted proxies for this application. '*' trusts all proxies -- standard and safe here
     * since this app is only ever reached through the host platform's edge proxy (Railway
     * staging, or whatever PaaS/reverse-proxy actually fronts it in production), never directly
     * exposed to the internet on its own. Without this, Laravel doesn't know the original request
     * was HTTPS (the platform terminates TLS and forwards plain HTTP internally), so
     * asset()/url() generate http:// links even on an https:// page. See $headers below for why
     * X-Forwarded-For specifically is NOT trusted despite this being '*'.
     *
     * @var array<int, string>|string|null
     */
    protected $proxies = '*';

    /**
     * The headers that should be used to detect proxies. Deliberately excludes
     * HEADER_X_FORWARDED_FOR: found via a live staging test that trusting it here, combined with
     * $proxies = '*', made RateLimiter's $request->ip() resolve to a different value on nearly
     * every request (46 distinct per-IP cache keys for ~43 requests, all from the same curl
     * client) -- Railway's edge network apparently doesn't send a stable single-hop X-Forwarded-
     * For the naive '*'-trust model expects, so the per-IP rate limit never accumulated past 1 on
     * any single key and silently stopped enforcing at all. Falling back to REMOTE_ADDR (the
     * platform's own edge/load-balancer address, stable per the platform, not per visitor) is
     * less precise -- multiple real visitors share one bucket -- but it's SAFE: consistent
     * counting that actually enforces a ceiling, rather than an bucket-per-request illusion of a
     * per-visitor limit that never triggers. Revisit if the real host's proxy topology is known
     * precisely enough to trust X-Forwarded-For against a specific proxy IP instead of '*'.
     *
     * @var int
     */
    protected $headers =
        Request::HEADER_X_FORWARDED_HOST |
        Request::HEADER_X_FORWARDED_PORT |
        Request::HEADER_X_FORWARDED_PROTO |
        Request::HEADER_X_FORWARDED_AWS_ELB;
}
