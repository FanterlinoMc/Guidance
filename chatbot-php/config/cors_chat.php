<?php

// Separate from Laravel's own config/cors.php (the fruitcake/laravel-cors package config) --
// this is the chat widget's own CORS allowlist, ported from getAllowedOrigins() in the TS
// original. Comma-separated list of origins allowed to call /api/chat cross-origin (e.g. the
// marketing site embedding the widget). Unset means no cross-origin caller is trusted.
return [
    'allowed_origins' => env('ALLOWED_ORIGINS', ''),
];
