<?php

namespace App\Services\SessionTranscript;

use App\Services\Compliance\PiiRedactor;
use App\SessionMessage;

// Phase 3: swapped from an append-only JSONL stopgap to a real session_messages table. PII is
// still redacted before the row is written so the durable transcript never carries raw
// emails/phones/SSNs/etc., regardless of what the visitor typed -- that guarantee doesn't change
// just because the store did.
final class TranscriptLogger
{
    /** @var PiiRedactor */
    private $piiRedactor;

    public function __construct(PiiRedactor $piiRedactor)
    {
        $this->piiRedactor = $piiRedactor;
    }

    public function log(string $sessionId, string $role, string $content): void
    {
        SessionMessage::create([
            'session_id' => $sessionId,
            'role' => $role,
            'content' => $this->piiRedactor->redact($content),
        ]);
    }
}
