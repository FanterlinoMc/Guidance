import type { SourceVisibility } from "@/features/source-classification";
import type { CorpusChunk } from "@/features/scraping";
import { getIdfIndex } from "./build-idf-index";
import { filterByVisibility } from "./filter-by-visibility";
import { loadCorpus } from "./load-corpus";
import { scoreChunk } from "./score-chunk";
import { tokenize } from "./tokenize";
import type { RetrievedChunk } from "./types";

const DEFAULT_TOP_K = 6;
// Default-deny (Step 9.2/13.1): a caller must explicitly widen this to see anything beyond
// public marketing content.
const DEFAULT_ALLOWED_VISIBILITY: SourceVisibility[] = ["public"];

export interface RetrieveContextOptions {
  entity?: CorpusChunk["entity"];
  topK?: number;
  allowedVisibility?: SourceVisibility[];
}

export function retrieveContext(query: string, options: RetrieveContextOptions = {}): RetrievedChunk[] {
  const { entity, topK = DEFAULT_TOP_K, allowedVisibility = DEFAULT_ALLOWED_VISIBILITY } = options;
  const queryTerms = tokenize(query);
  if (queryTerms.length === 0) return [];

  const corpus = loadCorpus();
  const entityFiltered = entity ? corpus.filter((chunk) => chunk.entity === entity) : corpus;
  const candidates = filterByVisibility(entityFiltered, (chunk) => chunk.visibility, allowedVisibility);
  const idf = getIdfIndex();

  return candidates
    .map((chunk) => ({ chunk, score: scoreChunk(queryTerms, chunk.text, idf) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(({ chunk }) => toRetrievedChunk(chunk));
}

// The corpus is generated from src/features/scraping/data/seed-sites.json (Step 9) and
// data/internal-docs/documents.ts (Step 9.1), whose entities match RetrievedChunk's narrower
// union — the cast is safe as long as that stays true. visibility/audience come straight from
// the chunk: each was resolved once at ingestion time (see CorpusChunk's comment), not
// re-derived here.
function toRetrievedChunk(chunk: CorpusChunk): RetrievedChunk {
  return {
    id: chunk.id,
    text: chunk.text,
    url: chunk.url,
    entity: chunk.entity as RetrievedChunk["entity"],
    title: chunk.title,
    section: chunk.section,
    visibility: chunk.visibility,
    audience: chunk.audience,
  };
}
