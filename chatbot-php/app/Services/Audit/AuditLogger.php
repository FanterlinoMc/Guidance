<?php

namespace App\Services\Audit;

use App\AuditLog;

// Phase 3: swapped from an append-only JSONL stopgap to a real audit_log table. logEvent()'s
// call signature is unchanged -- every caller (guardrails, retrieval) still just calls this the
// same way, matching how the original codebase already treats this store as swappable.
final class AuditLogger
{
    public function logEvent(string $reasonCode, ?array $detail = null, ?string $sessionId = null): void
    {
        AuditLog::create([
            'session_id' => $sessionId,
            'reason_code' => $reasonCode,
            'detail' => $detail,
        ]);
    }
}
