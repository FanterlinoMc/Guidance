import type { CorpusChunk } from "@/features/scraping";
import { getIdfIndex } from "./build-idf-index";
import { loadCorpus } from "./load-corpus";
import { scoreChunk } from "./score-chunk";
import { tokenize } from "./tokenize";
import type { RetrievedChunk } from "./types";

const DEFAULT_TOP_K = 6;

export interface RetrieveContextOptions {
  entity?: CorpusChunk["entity"];
  topK?: number;
}

export function retrieveContext(query: string, options: RetrieveContextOptions = {}): RetrievedChunk[] {
  const { entity, topK = DEFAULT_TOP_K } = options;
  const queryTerms = tokenize(query);
  if (queryTerms.length === 0) return [];

  const corpus = loadCorpus();
  const candidates = entity ? corpus.filter((chunk) => chunk.entity === entity) : corpus;
  const idf = getIdfIndex();

  return candidates
    .map((chunk) => ({ chunk, score: scoreChunk(queryTerms, chunk.text, idf) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(({ chunk }) => toRetrievedChunk(chunk));
}

// The corpus is generated exclusively from src/features/scraping/data/seed-sites.json, whose
// three entities match RetrievedChunk's narrower union — the cast is safe as long as that
// stays true.
function toRetrievedChunk(chunk: CorpusChunk): RetrievedChunk {
  return {
    text: chunk.text,
    url: chunk.url,
    entity: chunk.entity as RetrievedChunk["entity"],
    title: chunk.title,
    section: chunk.section,
  };
}
