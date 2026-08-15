<?php

namespace App\Services\Retrieval;

final class ChunkScorer
{
    /** @var Tokenizer */
    private $tokenizer;

    public function __construct(Tokenizer $tokenizer)
    {
        $this->tokenizer = $tokenizer;
    }

    // TF-IDF lexical stand-in for real cosine similarity over embeddings (blocked on an
    // OpenAI/Pinecone account) -- term frequency in the chunk, weighted by how rare that term is
    // across the whole corpus (via idf), normalized by chunk length so long chunks don't win
    // purely on size.
    public function score(array $queryTerms, string $chunkText, array $idf): float
    {
        $chunkTerms = $this->tokenizer->tokenize($chunkText);
        if (count($chunkTerms) === 0) {
            return 0.0;
        }

        $chunkTermCounts = [];
        foreach ($chunkTerms as $term) {
            $chunkTermCounts[$term] = ($chunkTermCounts[$term] ?? 0) + 1;
        }

        $rawScore = 0.0;
        foreach ($queryTerms as $term) {
            $termFrequency = $chunkTermCounts[$term] ?? 0;
            $inverseDocFrequency = $idf[$term] ?? 0; // terms unseen in the corpus contribute nothing
            $rawScore += $termFrequency * $inverseDocFrequency;
        }

        return $rawScore / sqrt(count($chunkTerms));
    }
}
