<?php

// Optional override for the global rate-limit bucket. Defaults to 2000/hour if unset, matching
// the TS original's getRateLimitGlobalPerHour() -- routed through env() with a fallback so an
// empty-string env var is treated as unset, not as "0" (a bug the original codebase specifically
// called out and fixed).
return [
    'global_per_hour' => env('RATE_LIMIT_GLOBAL_PER_HOUR') ?: 2000,
];
