export type SeedPage = { path: string };

export type SeedSite = {
  entity: string;
  baseUrl: string;
  status: string;
  pages: SeedPage[];
};

export type PageSection = { heading: string; text: string };

export type ScrapedPage = {
  url: string;
  entity: string;
  title: string;
  sections: PageSection[];
};

import type { SourceAudience, SourceVisibility } from "@/features/source-classification";

export type CorpusChunk = {
  id: string;
  entity: string;
  url: string;
  title: string;
  section: string;
  text: string;
  tokenEstimate: number;
  // Resolved once at ingestion time (scripts/chunk.ts for scraped pages, always "public"/
  // "consumer"; scripts/ingest-internal-docs.ts for Step 9.1 documents, per-document) rather
  // than re-derived at read time -- different chunks from the same ingestion source can carry
  // different classifications (e.g. a public fatwa vs. an internal call script).
  visibility: SourceVisibility;
  audience: SourceAudience;
};
