import type { RetrievedChunk } from "@/features/retrieval";

// Long enough that a coincidental phrase overlap is implausible, short enough to still catch a
// leaked excerpt from the middle of a chunk rather than requiring the whole chunk verbatim.
const EXCERPT_LENGTH = 40;

// Second line of defense behind retrieveContext()'s default-deny visibility filter (Step
// 9.2/13.1): even if a non-public chunk somehow ended up in this turn's context, its text must
// never appear verbatim in what actually reaches the visitor. Checked against the chunks this
// turn actually retrieved, not the whole corpus — the risk is what was in context, not what
// exists in the KB.
export function detectInternalContentLeak(message: string, retrievedChunks: RetrievedChunk[]): boolean {
  return retrievedChunks
    .filter((chunk) => chunk.visibility !== "public")
    .some((chunk) => containsVerbatimExcerpt(message, chunk.text));
}

function containsVerbatimExcerpt(message: string, chunkText: string): boolean {
  if (chunkText.length <= EXCERPT_LENGTH) return message.includes(chunkText);

  for (let start = 0; start <= chunkText.length - EXCERPT_LENGTH; start += EXCERPT_LENGTH) {
    if (message.includes(chunkText.slice(start, start + EXCERPT_LENGTH))) return true;
  }
  return false;
}
