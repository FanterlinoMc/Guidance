<?php

namespace App\Services\SessionTranscript;

use App\Services\Compliance\PiiRedactor;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

// Append-only JSONL stopgap for a real session_messages table, ported directly from the TS
// original's same pattern (Phase 3 of the rewrite swaps this for real DB persistence). PII is
// redacted before the line ever touches disk so the durable transcript never carries raw
// emails/phones/SSNs/etc., regardless of what the visitor typed.
final class TranscriptLogger
{
    private const LOG_PATH = 'transcripts/messages.jsonl';

    /** @var PiiRedactor */
    private $piiRedactor;

    public function __construct(PiiRedactor $piiRedactor)
    {
        $this->piiRedactor = $piiRedactor;
    }

    public function log(string $sessionId, string $role, string $content): void
    {
        $message = [
            'id' => (string) Str::uuid(),
            'sessionId' => $sessionId,
            'role' => $role,
            'content' => $this->piiRedactor->redact($content),
            'createdAt' => now()->toISOString(),
        ];

        Storage::append(self::LOG_PATH, json_encode($message, JSON_UNESCAPED_SLASHES));
    }
}
