<?php

namespace App\Services\Audit;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

// NOTE: append-only JSONL stopgap, ported directly from the TS original's same pattern -- Phase
// 3 of the rewrite swaps this for a real audit_log table without changing logEvent()'s call
// signature, matching how the source codebase already treats this as swappable.
final class AuditLogger
{
    private const LOG_PATH = 'audit/events.jsonl';

    public function logEvent(string $reasonCode, ?array $detail = null, ?string $sessionId = null): void
    {
        $event = [
            'id' => (string) Str::uuid(),
            'timestamp' => now()->toISOString(),
            'reasonCode' => $reasonCode,
            'sessionId' => $sessionId,
            'detail' => $detail,
        ];

        $line = json_encode($event, JSON_UNESCAPED_SLASHES) . PHP_EOL;
        Storage::append(self::LOG_PATH, $line);
    }
}
