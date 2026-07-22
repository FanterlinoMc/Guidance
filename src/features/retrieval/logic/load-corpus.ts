import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { CorpusChunk } from "@/features/scraping";

const SCRAPED_CORPUS_PATH = join(process.cwd(), "data", "scraped", "guidance-chunks.json");
const INTERNAL_DOCS_CORPUS_PATH = join(process.cwd(), "data", "internal-docs", "internal-chunks.json");

let cachedCorpus: CorpusChunk[] | null = null;

// Both corpus JSON files are gitignored (regenerated via scripts/scrape.ts + scripts/chunk.ts
// for public-web pages, scripts/ingest-internal-docs.ts for Step 9.1 documents), so a fresh
// checkout won't have either yet. Fail soft with an empty array per missing file rather than
// crashing the whole module on import — retrieveContext() then just returns fewer/no results.
export function loadCorpus(): CorpusChunk[] {
  if (cachedCorpus) return cachedCorpus;

  cachedCorpus = [...readChunkFile(SCRAPED_CORPUS_PATH), ...readChunkFile(INTERNAL_DOCS_CORPUS_PATH)];
  return cachedCorpus;
}

function readChunkFile(path: string): CorpusChunk[] {
  if (!existsSync(path)) {
    console.warn(`[retrieval] No corpus at ${path} — it will contribute no chunks until generated.`);
    return [];
  }
  return JSON.parse(readFileSync(path, "utf-8")) as CorpusChunk[];
}
