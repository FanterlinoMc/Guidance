<?php

namespace App\Services\Retrieval;

final class IdfIndex
{
    /** @var array<string, float>|null */
    private $cachedIndex;

    /** @var CorpusLoader */
    private $corpusLoader;

    /** @var Tokenizer */
    private $tokenizer;

    public function __construct(CorpusLoader $corpusLoader, Tokenizer $tokenizer)
    {
        $this->corpusLoader = $corpusLoader;
        $this->tokenizer = $tokenizer;
    }

    // Smoothed inverse document frequency: log(N / (1 + docFreq)) + 1. Without this, raw
    // term-frequency scoring lets common words (e.g. "financing", appearing in most chunks)
    // drown out the rare, specific terms (e.g. "musharakah") that actually distinguish a
    // relevant chunk.
    public function get(): array
    {
        if ($this->cachedIndex !== null) {
            return $this->cachedIndex;
        }

        $corpus = $this->corpusLoader->load();
        $docFrequency = [];

        foreach ($corpus as $chunk) {
            $terms = array_unique($this->tokenizer->tokenize($chunk['text']));
            foreach ($terms as $term) {
                $docFrequency[$term] = ($docFrequency[$term] ?? 0) + 1;
            }
        }

        $corpusSize = count($corpus);
        $index = [];
        foreach ($docFrequency as $term => $freq) {
            $index[$term] = log($corpusSize / (1 + $freq)) + 1;
        }

        $this->cachedIndex = $index;

        return $index;
    }
}
