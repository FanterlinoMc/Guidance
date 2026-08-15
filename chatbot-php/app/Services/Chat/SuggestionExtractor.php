<?php

namespace App\Services\Chat;

final class SuggestionExtractor
{
    // The system prompt's "# Suggested follow-ups" section asks the model to end its reply with
    // a `SUGGESTIONS: [...]` line. This strips that line from the visible reply and parses it
    // into a plain string array, BEFORE the output guardrail sees the text -- so a malformed or
    // malicious suggestions line never reaches the visitor as literal text, and the guardrail's
    // regex checks only ever run against the real reply.
    private const SUGGESTIONS_LINE = '/\n{0,2}SUGGESTIONS:\s*(\[[\s\S]*?\])\s*$/i';

    private const MAX_SUGGESTIONS = 3;

    /**
     * @return array{text: string, suggestions: string[]}
     */
    public function extract(string $replyText): array
    {
        if (! preg_match(self::SUGGESTIONS_LINE, $replyText, $match, PREG_OFFSET_CAPTURE)) {
            return ['text' => $replyText, 'suggestions' => []];
        }

        $matchStart = $match[0][1];
        $text = rtrim(substr($replyText, 0, $matchStart));

        $parsed = json_decode($match[1][0], true);
        if (! is_array($parsed)) {
            // Malformed JSON from the model -- fail closed to no suggestions rather than crash.
            return ['text' => $text, 'suggestions' => []];
        }

        $suggestions = array_values(array_filter($parsed, function ($item): bool {
            return is_string($item);
        }));

        return ['text' => $text, 'suggestions' => array_slice($suggestions, 0, self::MAX_SUGGESTIONS)];
    }
}
