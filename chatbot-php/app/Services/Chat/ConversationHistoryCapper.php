<?php

namespace App\Services\Chat;

final class ConversationHistoryCapper
{
    // NOTE: the TS original uses gpt-tokenizer (real BPE token counts). There's no trustworthy
    // PHP 7.3 equivalent worth adding as a dependency for a soft budget heuristic, not a hard
    // model limit (see cap-conversation-history.ts's original comment: this bounds cost/latency,
    // it doesn't prevent an overflow error). ~4 characters per English token is the standard
    // rough estimate; this is an intentional, documented divergence from exact token counts.
    private const CHARS_PER_TOKEN_ESTIMATE = 4;

    /**
     * Keeps the most recent turns that fit within maxTokens (estimated), dropping the oldest
     * first. Always keeps at least the single most recent turn, even if it alone exceeds the
     * budget -- an empty history is worse than one oversized turn.
     *
     * @param array<int, array{role: string, content: string}> $turns
     * @return array<int, array{role: string, content: string}>
     */
    public function cap(array $turns, int $maxTokens): array
    {
        $capped = [];
        $totalTokens = 0;

        for ($i = count($turns) - 1; $i >= 0; $i--) {
            $turnTokens = $this->estimateTokens($turns[$i]['content']);
            if (count($capped) > 0 && $totalTokens + $turnTokens > $maxTokens) {
                break;
            }
            array_unshift($capped, $turns[$i]);
            $totalTokens += $turnTokens;
        }

        return $capped;
    }

    private function estimateTokens(string $content): int
    {
        return (int) ceil(mb_strlen($content) / self::CHARS_PER_TOKEN_ESTIMATE);
    }
}
