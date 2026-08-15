<?php

// DECISION (ported from claude-model.ts, 2026-07-22): Sonnet 5 over Opus 4.8/Haiku 4.5 -- this
// is a high-volume, consumer-facing widget where cost scales directly with traffic, but it also
// enforces compliance-sensitive guardrails (Shariah framing, GLBA, no rate/approval promises)
// where quality matters enough to rule out Haiku. Sonnet is the balance point between the two.
return [
    'claude_model' => env('CLAUDE_MODEL', 'claude-sonnet-5'),
    'max_reply_tokens' => 4096,

    // Starting judgment call, not a hard model limit -- Claude's actual context window is far
    // larger. Bounds cost/latency and keeps the model focused on recent conversation.
    'max_history_tokens' => 4000,
];
