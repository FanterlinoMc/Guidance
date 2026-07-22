// Step 9.1: ingests the internal document library (SOPs, scripts, FAQs, fatwas, presentations)
// fetched from Google Drive into the same CorpusChunk shape scripts/chunk.ts produces for
// scraped pages, with per-document visibility/audience baked in at chunk-build time (see
// CorpusChunk's comment in src/features/scraping/logic/types.ts for why that has to be
// per-document rather than derived from a single source-type at read time). Source text lives
// in src/features/document-ingestion/data/documents.ts (git-tracked -- it's curated input, the
// same status as scraping's seed-sites.json, not regeneratable output like the corpus JSON
// below), hand-transcribed from Drive with a visibility tier per document confirmed with the
// user on 2026-07-22 (public/agent/internal). Writes data/internal-docs/internal-chunks.json
// (gitignored, regenerate via this script) for load-corpus.ts to merge with the scraped corpus.

import { encode } from "gpt-tokenizer";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { INTERNAL_DOCUMENTS } from "../src/features/document-ingestion";
import { redactPii } from "../src/features/pii-redaction";
import { buildChunkId, chunkSection, splitSentences } from "../src/features/scraping";
import type { CorpusChunk } from "../src/features/scraping";

const MIN_CHUNK_CHARS = 100;

// Drive's markdown export leaves stray backslash-escapes in front of punctuation (\_, \#, \!,
// \-, \.) that add noise to TF-IDF term matching without changing meaning -- strip the escape,
// keep the character.
function stripDriveMarkdownEscapes(text: string): string {
  return text.replace(/\\([_#!.\-])/g, "$1");
}

function main() {
  const chunks: CorpusChunk[] = [];

  for (const doc of INTERNAL_DOCUMENTS) {
    const cleanText = redactPii(stripDriveMarkdownEscapes(doc.text));
    const sentences = splitSentences(cleanText);
    const docChunks = chunkSection(sentences);

    docChunks.forEach((text, chunkIndex) => {
      if (text.length < MIN_CHUNK_CHARS) return;
      chunks.push({
        id: buildChunkId(doc.entity, doc.id, 0, chunkIndex),
        entity: doc.entity,
        url: `internal-doc://${doc.id}`,
        title: doc.title,
        section: doc.title,
        text,
        tokenEstimate: encode(text).length,
        visibility: doc.visibility,
        audience: doc.audience,
      });
    });
  }

  const outPath = resolve(__dirname, "../data/internal-docs/internal-chunks.json");
  writeFileSync(outPath, JSON.stringify(chunks, null, 2), "utf-8");

  const byVisibility = chunks.reduce<Record<string, number>>((counts, chunk) => {
    counts[chunk.visibility] = (counts[chunk.visibility] ?? 0) + 1;
    return counts;
  }, {});
  console.log(
    `Wrote ${chunks.length} chunks from ${INTERNAL_DOCUMENTS.length} documents to ${outPath}\n` +
      `By visibility: ${JSON.stringify(byVisibility)}`,
  );
}

main();
