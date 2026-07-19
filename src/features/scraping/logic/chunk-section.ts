import { encode } from "gpt-tokenizer";

export const TARGET_CHUNK_TOKENS = 600;
export const CHUNK_OVERLAP_TOKENS = 80;

// Splits a section's sentences into ~TARGET_CHUNK_TOKENS chunks, carrying the trailing
// ~CHUNK_OVERLAP_TOKENS worth of sentences into the next chunk so retrieval doesn't lose context
// at a chunk boundary.
export function chunkSection(sentences: string[]): string[] {
  const chunks: string[] = [];
  let current: string[] = [];
  let currentTokens = 0;

  for (const sentence of sentences) {
    const sentenceTokens = encode(sentence).length;

    if (currentTokens + sentenceTokens > TARGET_CHUNK_TOKENS && current.length > 0) {
      chunks.push(current.join(" "));

      const overlapSentences: string[] = [];
      let overlapTokens = 0;
      for (let i = current.length - 1; i >= 0 && overlapTokens < CHUNK_OVERLAP_TOKENS; i--) {
        overlapSentences.unshift(current[i]);
        overlapTokens += encode(current[i]).length;
      }
      current = overlapSentences;
      currentTokens = overlapTokens;
    }

    current.push(sentence);
    currentTokens += sentenceTokens;
  }

  if (current.length > 0) chunks.push(current.join(" "));
  return chunks;
}
