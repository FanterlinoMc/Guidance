<?php

namespace App\Services\Guardrails;

final class InternalLeakDetector
{
    // Long enough that a coincidental phrase overlap is implausible, short enough to still catch
    // a leaked excerpt from the middle of a chunk rather than requiring the whole chunk verbatim.
    private const EXCERPT_LENGTH = 40;

    /**
     * Second line of defense behind RetrieveContext's default-deny visibility filter: even if a
     * non-public chunk somehow ended up in this turn's context, its text must never appear
     * verbatim in what actually reaches the visitor. Checked against the chunks this turn
     * actually retrieved, not the whole corpus -- the risk is what was in context, not what
     * exists in the KB.
     *
     * @param array<int, array{text: string, visibility: string}> $retrievedChunks
     */
    public function detect(string $message, array $retrievedChunks): bool
    {
        foreach ($retrievedChunks as $chunk) {
            if ($chunk['visibility'] !== 'public' && $this->containsVerbatimExcerpt($message, $chunk['text'])) {
                return true;
            }
        }

        return false;
    }

    private function containsVerbatimExcerpt(string $message, string $chunkText): bool
    {
        // str_contains() is PHP 8.0+; strpos() !== false is the 7.3-safe equivalent.
        $length = mb_strlen($chunkText);
        if ($length <= self::EXCERPT_LENGTH) {
            return strpos($message, $chunkText) !== false;
        }

        for ($start = 0; $start <= $length - self::EXCERPT_LENGTH; $start += self::EXCERPT_LENGTH) {
            if (strpos($message, mb_substr($chunkText, $start, self::EXCERPT_LENGTH)) !== false) {
                return true;
            }
        }

        return false;
    }
}
