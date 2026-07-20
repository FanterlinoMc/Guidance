import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { CorpusChunk } from "@/features/scraping";

const CORPUS_PATH = join(process.cwd(), "data", "scraped", "guidance-chunks.json");

let cachedCorpus: CorpusChunk[] | null = null;

// The corpus JSON is gitignored (regenerated via scripts/scrape.ts + scripts/chunk.ts), so a
// fresh checkout won't have it yet. Fail soft with an empty corpus rather than crashing the
// whole module on import — retrieveContext() then just returns no results.
export function loadCorpus(): CorpusChunk[] {
  if (cachedCorpus) return cachedCorpus;

  if (!existsSync(CORPUS_PATH)) {
    console.warn(
      `[retrieval] No corpus at ${CORPUS_PATH} — run "npx tsx scripts/scrape.ts" then "npx tsx scripts/chunk.ts" first.`,
    );
    cachedCorpus = [];
    return cachedCorpus;
  }

  cachedCorpus = JSON.parse(readFileSync(CORPUS_PATH, "utf-8")) as CorpusChunk[];
  return cachedCorpus;
}
