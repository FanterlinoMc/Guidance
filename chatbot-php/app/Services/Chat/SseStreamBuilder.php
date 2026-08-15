<?php

namespace App\Services\Chat;

final class SseStreamBuilder
{
    /**
     * Wire format is intentionally simple, not strict SSE: each line is `data: {"text":
     * "..."}\n`, optionally followed by one `data: {"suggestions": [...]}\n` line, terminated by
     * `data: [DONE]\n`. This exact shape is the frozen wire contract the eval suite
     * (tests/evals/*.eval.ts) asserts against -- do not change it without updating both sides.
     *
     * @param string[] $chunks
     * @param string[] $suggestions
     */
    public function build(array $chunks, array $suggestions = []): string
    {
        $lines = '';
        foreach ($chunks as $chunk) {
            $lines .= 'data: ' . json_encode(['text' => $chunk], JSON_UNESCAPED_SLASHES) . "\n";
        }

        if (count($suggestions) > 0) {
            $lines .= 'data: ' . json_encode(['suggestions' => $suggestions], JSON_UNESCAPED_SLASHES) . "\n";
        }

        $lines .= "data: [DONE]\n";

        return $lines;
    }

    /**
     * Splits a complete, already guardrail-checked reply into word-sized deltas so the client's
     * per-delta rendering has something to animate. The full reply is generated and safety-
     * checked server-side before any of it is chunked out to the client -- see ClaudeClient and
     * ChatController.
     *
     * @return string[]
     */
    public function chunkTextForStreaming(string $text): array
    {
        $words = explode(' ', $text);

        return array_map(function (string $word, int $index): string {
            return $index === 0 ? $word : " {$word}";
        }, $words, array_keys($words));
    }
}
