import { classifySource } from "@/features/source-classification";
import type { SourceType, SourceVisibility } from "@/features/source-classification";
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
  const candidates = filterByVisibility(
    entityFiltered,
    () => classifySource(toSourceType()).visibility,
    allowedVisibility,
  );
  const idf = getIdfIndex();

  return candidates
    .map((chunk) => ({ chunk, score: scoreChunk(queryTerms, chunk.text, idf) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(({ chunk }) => toRetrievedChunk(chunk));
}

// Every chunk in the corpus today comes from src/features/scraping (Step 9), which only ever
// produces public marketing pages. Step 9.1 (internal SOP/fatwa ingestion) will give chunks a
// real per-document source type to branch on instead of this constant.
function toSourceType(): SourceType {
  return "public-web";
}

// The corpus is generated exclusively from src/features/scraping/data/seed-sites.json, whose
// three entities match RetrievedChunk's narrower union — the cast is safe as long as that
// stays true.
function toRetrievedChunk(chunk: CorpusChunk): RetrievedChunk {
  const { visibility, audience } = classifySource(toSourceType());
  return {
    id: chunk.id,
    text: chunk.text,
    url: chunk.url,
    entity: chunk.entity as RetrievedChunk["entity"],
    title: chunk.title,
    section: chunk.section,
    visibility,
    audience,
  };
}
