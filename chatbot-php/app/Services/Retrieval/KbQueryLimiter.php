<?php

namespace App\Services\Retrieval;

use Illuminate\Support\Facades\Cache;

final class KbQueryLimiter
{
    private const WINDOW_SECONDS = 3600;

    // Generous relative to the 30 msg/hr chat rate limit -- this exists to catch a session that
    // hammers retrieval directly (bypassing the chat turn cadence), not to double-enforce the
    // same 30/hr ceiling.
    private const MAX_QUERIES_PER_SESSION = 40;

    private const NEAR_DUPLICATE_JACCARD_THRESHOLD = 0.6;

    // A real conversation asks a handful of genuinely different questions. This many
    // lexically-near-identical queries in one window (e.g. one word swapped at a time) looks
    // like someone enumerating chunk content rather than talking to the assistant.
    private const NEAR_DUPLICATE_ALERT_COUNT = 8;

    // NOTE: unlike the TS original's in-memory Map (safe there since Node keeps one long-lived
    // process), PHP has no state that survives between requests -- every /api/chat call is a
    // fresh process. This MUST be cache-backed (Laravel's Cache facade, Redis or DB driver) from
    // day one, not ported as an in-memory structure first and fixed later.
    private const CACHE_KEY_PREFIX = 'kb_query_history:';

    /** @var Tokenizer */
    private $tokenizer;

    public function __construct(Tokenizer $tokenizer)
    {
        $this->tokenizer = $tokenizer;
    }

    /**
     * @return array{allowed: bool, reason: string|null}
     */
    public function check(string $sessionId, string $query): array
    {
        $cacheKey = self::CACHE_KEY_PREFIX . $sessionId;
        $history = Cache::get($cacheKey, ['queryTermSets' => []]);

        if (count($history['queryTermSets']) >= self::MAX_QUERIES_PER_SESSION) {
            return ['allowed' => false, 'reason' => 'RATE_EXCEEDED'];
        }

        $queryTerms = $this->tokenizer->tokenize($query);
        $nearDuplicateCount = 0;
        foreach ($history['queryTermSets'] as $previousTerms) {
            if ($this->jaccardSimilarity($previousTerms, $queryTerms) >= self::NEAR_DUPLICATE_JACCARD_THRESHOLD) {
                $nearDuplicateCount++;
            }
        }

        if ($nearDuplicateCount >= self::NEAR_DUPLICATE_ALERT_COUNT) {
            return ['allowed' => false, 'reason' => 'NEAR_DUPLICATE_PROBING'];
        }

        $history['queryTermSets'][] = $queryTerms;
        Cache::put($cacheKey, $history, self::WINDOW_SECONDS);

        return ['allowed' => true, 'reason' => null];
    }

    /**
     * @param string[] $a
     * @param string[] $b
     */
    private function jaccardSimilarity(array $a, array $b): float
    {
        $setA = array_unique($a);
        $setB = array_unique($b);
        if (count($setA) === 0 || count($setB) === 0) {
            return 0.0;
        }

        $intersectionSize = count(array_intersect($setA, $setB));
        $unionSize = count(array_unique(array_merge($setA, $setB)));

        return $intersectionSize / $unionSize;
    }
}
