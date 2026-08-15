<?php

namespace App\Services\Compliance;

use App\Services\Guardrails\Patterns;

final class PiiRedactor
{
    // guardrails/Patterns.php is the single source of truth for what counts as PII in this
    // codebase. Re-flagged "g" (global) here because redaction must replace every match in a
    // document, not just detect the first one like the guardrail's preg_match() calls do.
    private const REDACTIONS = [
        ['pattern' => Patterns::EMAIL, 'replacement' => '[REDACTED-EMAIL]'],
        ['pattern' => Patterns::SSN, 'replacement' => '[REDACTED-SSN]'],
        ['pattern' => Patterns::CREDIT_CARD, 'replacement' => '[REDACTED-CARD]'],
        ['pattern' => Patterns::ACCOUNT_NUMBER, 'replacement' => '[REDACTED-ACCOUNT]'],
        ['pattern' => Patterns::PHONE, 'replacement' => '[REDACTED-PHONE]'],
    ];

    // Masks PII before it reaches durable storage (session transcripts, ingested documents) --
    // the raw copy stays only wherever the caller already had it in memory for that one request.
    // PHP's preg_replace() replaces every match by default (unlike JS's .replace() without the
    // /g flag), so the patterns are used as-is with no flag manipulation needed.
    public function redact(string $text): string
    {
        foreach (self::REDACTIONS as $redaction) {
            $text = preg_replace($redaction['pattern'], $redaction['replacement'], $text);
        }

        return $text;
    }
}
