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
     * asset()/url() generate http:// links even on an https:// page.
     *
     * @var array<int, string>|string|null
     */
    protected $proxies = '*';

    /**
     * The headers that should be used to detect proxies.
     *
     * @var int
     */
    protected $headers =
        Request::HEADER_X_FORWARDED_FOR |
        Request::HEADER_X_FORWARDED_HOST |
        Request::HEADER_X_FORWARDED_PORT |
        Request::HEADER_X_FORWARDED_PROTO |
        Request::HEADER_X_FORWARDED_AWS_ELB;
}
