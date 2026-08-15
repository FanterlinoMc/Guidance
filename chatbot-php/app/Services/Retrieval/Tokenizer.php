<?php

namespace App\Services\Retrieval;

final class Tokenizer
{
    // Common English words that appear in almost every chunk and would otherwise dominate the
    // term-overlap score without signaling relevance.
    private const STOPWORDS = [
        'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'can', 'do', 'does', 'for', 'from', 'how',
        'i', 'in', 'is', 'it', 'of', 'on', 'or', 'our', 'so', 'that', 'the', 'their', 'there', 'this',
        'to', 'we', 'what', 'when', 'where', 'which', 'who', 'will', 'with', 'you', 'your',
    ];

    // Unicode-aware (\p{L}\p{N}, not [a-z0-9]) so a query in Arabic/Urdu/Bengali/etc. still
    // produces tokens instead of matching zero characters. Still English-only lexical text on
    // the corpus side -- this doesn't give real cross-lingual semantic matching -- but it lets a
    // non-English query still match wherever the corpus and the query share a literal term
    // (Islamic-finance loanwords and numbers commonly stay untranslated across languages).
    public function tokenize(string $text): array
    {
        preg_match_all('/[\p{L}\p{N}]+/u', mb_strtolower($text), $matches);
        $stopwords = array_flip(self::STOPWORDS);

        // Arrow functions (fn () => ...) are PHP 7.4+; a `use`-closure is the 7.3-safe form.
        return array_values(array_filter(
            $matches[0],
            function (string $word) use ($stopwords): bool {
                return ! isset($stopwords[$word]);
            },
        ));
    }
}
