<?php

namespace App\Services\Retrieval;

final class RetrieveContext
{
    private const DEFAULT_TOP_K = 6;

    // Default-deny: a caller must explicitly widen this to see anything beyond public
    // marketing content.
    private const DEFAULT_ALLOWED_VISIBILITY = ['public'];

    /** @var CorpusLoader */
    private $corpusLoader;

    /** @var Tokenizer */
    private $tokenizer;

    /** @var VisibilityFilter */
    private $visibilityFilter;

    /** @var IdfIndex */
    private $idfIndex;

    /** @var ChunkScorer */
    private $chunkScorer;

    public function __construct(
        CorpusLoader $corpusLoader,
        Tokenizer $tokenizer,
        VisibilityFilter $visibilityFilter,
        IdfIndex $idfIndex,
        ChunkScorer $chunkScorer
    ) {
        $this->corpusLoader = $corpusLoader;
        $this->tokenizer = $tokenizer;
        $this->visibilityFilter = $visibilityFilter;
        $this->idfIndex = $idfIndex;
        $this->chunkScorer = $chunkScorer;
    }

    /**
     * @param array{entity?: string, topK?: int, allowedVisibility?: string[]} $options
     * @return array<int, array<string, mixed>>
     */
    public function retrieve(string $query, array $options = []): array
    {
        $entity = $options['entity'] ?? null;
        $topK = $options['topK'] ?? self::DEFAULT_TOP_K;
        $allowedVisibility = $options['allowedVisibility'] ?? self::DEFAULT_ALLOWED_VISIBILITY;

        $queryTerms = $this->tokenizer->tokenize($query);
        if (count($queryTerms) === 0) {
            return [];
        }

        $corpus = $this->corpusLoader->load();
        $entityFiltered = $entity === null
            ? $corpus
            : array_values(array_filter($corpus, function (array $chunk) use ($entity): bool {
                return $chunk['entity'] === $entity;
            }));

        $candidates = $this->visibilityFilter->filter($entityFiltered, $allowedVisibility);
        $idf = $this->idfIndex->get();

        $scored = [];
        foreach ($candidates as $chunk) {
            $score = $this->chunkScorer->score($queryTerms, $chunk['text'], $idf);
            if ($score > 0) {
                $scored[] = ['chunk' => $chunk, 'score' => $score];
            }
        }

        usort($scored, function (array $a, array $b): int {
            return $b['score'] <=> $a['score'];
        });

        $top = array_slice($scored, 0, $topK);

        return array_map(function (array $entry): array {
            return $this->toRetrievedChunk($entry['chunk']);
        }, $top);
    }

    /**
     * @param array<string, mixed> $chunk
     * @return array<string, mixed>
     */
    private function toRetrievedChunk(array $chunk): array
    {
        return [
            'id' => $chunk['id'],
            'text' => $chunk['text'],
            'url' => $chunk['url'],
            'entity' => $chunk['entity'],
            'title' => $chunk['title'] ?? null,
            'section' => $chunk['section'] ?? null,
            'visibility' => $chunk['visibility'],
            'audience' => $chunk['audience'],
        ];
    }
}
