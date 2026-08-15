<?php

namespace App\Services\Leads;

use App\Services\Guardrails\Patterns;

final class LeadFieldExtractor
{
    // Only email and phone are reliably regex-extractable from free text. Name/city/timeline
    // require actual language understanding (a live-model structured-extraction step that
    // doesn't exist in this codebase) -- a regex guess would just be wrong more often than not,
    // so those fields are left null here rather than fabricated.
    public function extract(string $message): array
    {
        $fields = [];

        if (preg_match(Patterns::EMAIL, $message, $match)) {
            $fields['email'] = $match[0];
        }
        if (preg_match(Patterns::PHONE, $message, $match)) {
            $fields['phone'] = $match[0];
        }

        return $fields;
    }
}
