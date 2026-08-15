<?php

namespace App\Services\Retrieval;

use Illuminate\Support\Facades\Log;

// Both corpus JSON files are produced by the Node ingestion scripts kept from the original
// codebase (scripts/scrape.js + scripts/chunk.js for public-web pages, scripts/ingest-internal-
// docs.js for internal documents) -- this class only reads their output, it never generates it.
// Fails soft with an empty array per missing file rather than crashing the whole app.
final class CorpusLoader
{
    /** @var array<int, array<string, mixed>>|null */
    private $cachedCorpus;

    /**
     * @return array<int, array<string, mixed>>
     */
    public function load(): array
    {
        if ($this->cachedCorpus !== null) {
            return $this->cachedCorpus;
        }

        $scrapedPath = storage_path('app/corpus/guidance-chunks.json');
        $internalPath = storage_path('app/corpus/internal-chunks.json');

        $this->cachedCorpus = array_merge(
            $this->readChunkFile($scrapedPath),
            $this->readChunkFile($internalPath),
        );

        return $this->cachedCorpus;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function readChunkFile(string $path): array
    {
        if (! file_exists($path)) {
            Log::warning("[retrieval] No corpus at {$path} -- it will contribute no chunks until generated.");

            return [];
        }

        $decoded = json_decode(file_get_contents($path), true);

        return $decoded ?? [];
    }
}
