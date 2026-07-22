// Splits data/scraped/guidance-corpus.json sections into ~600-token chunks (80-token overlap,
// sentence-boundary breaks), drops chunks under 100 chars, and writes
// data/scraped/guidance-chunks.json for the RAG pipeline to embed.

import { encode } from "gpt-tokenizer";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { classifySource } from "../src/features/source-classification";
import { buildChunkId, chunkSection, splitSentences } from "../src/features/scraping";
import type { CorpusChunk, ScrapedPage } from "../src/features/scraping";

const MIN_CHUNK_CHARS = 100;

function main() {
  const corpusPath = resolve(__dirname, "../data/scraped/guidance-corpus.json");
  const pages: ScrapedPage[] = JSON.parse(readFileSync(corpusPath, "utf-8"));

  const chunks: CorpusChunk[] = [];
  const { visibility, audience } = classifySource("public-web");

  for (const page of pages) {
    const pageSlug = new URL(page.url).pathname || "home";

    page.sections.forEach((section, sectionIndex) => {
      const sentences = splitSentences(section.text);
      const sectionChunks = chunkSection(sentences);

      sectionChunks.forEach((text, chunkIndex) => {
        if (text.length < MIN_CHUNK_CHARS) return;
        chunks.push({
          id: buildChunkId(page.entity, pageSlug, sectionIndex, chunkIndex),
          entity: page.entity,
          url: page.url,
          title: page.title,
          section: section.heading,
          text,
          tokenEstimate: encode(text).length,
          visibility,
          audience,
        });
      });
    });
  }

  const outPath = resolve(__dirname, "../data/scraped/guidance-chunks.json");
  writeFileSync(outPath, JSON.stringify(chunks, null, 2), "utf-8");

  const avgTokens = chunks.reduce((sum, c) => sum + c.tokenEstimate, 0) / (chunks.length || 1);
  console.log(
    `Wrote ${chunks.length} chunks from ${pages.length} pages to ${outPath} (avg ${avgTokens.toFixed(0)} tokens/chunk)`,
  );
}

main();
