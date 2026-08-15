<?php

namespace App\Services\RateLimit;

use App\Exceptions\AppException;
use Illuminate\Support\Facades\Cache;

final class RateLimiter
{
    private const WINDOW_SECONDS = 3600;

    private const PER_IP_LIMIT = 30;

    // NOTE: unlike the TS original's in-memory Map (fine there -- Node is one long-lived
    // process), PHP has no state that survives between requests, so a direct port would be
    // *worse* than the original's own documented multi-instance caveat: broken across every
    // single request, not just across instances. Cache-backed (Redis/DB driver) from day one.
    private const CACHE_KEY_PREFIX = 'rate_limit:';

    private const GLOBAL_CACHE_KEY = 'rate_limit:__global__';

    public function enforce(string $clientIp): void
    {
        $globalLimit = (int) config('rate_limit.global_per_hour', 2000);

        $globalCount = $this->increment(self::GLOBAL_CACHE_KEY);
        $ipCount = $this->increment(self::CACHE_KEY_PREFIX . $clientIp);

        if ($globalCount > $globalLimit || $ipCount > self::PER_IP_LIMIT) {
            throw new AppException('RATE_LIMITED', 'Rate limit exceeded.', 429);
        }
    }

    private function increment(string $key): int
    {
        if (! Cache::has($key)) {
            Cache::put($key, 0, self::WINDOW_SECONDS);
        }

        return Cache::increment($key);
    }
}
