import { tokenize } from "./tokenize";

// NOTE: real cosine similarity over embeddings is blocked on Steps 11/12 (OpenAI + Pinecone
// accounts). This is a TF-IDF lexical stand-in with the same shape as the eventual scorer —
// term frequency in the chunk, weighted by how rare that term is across the whole corpus (via
// idf), normalized by chunk length so long chunks don't win purely on size. Swap the body out
// once embeddings land; retrieveContext()'s callers don't need to change.
export function scoreChunk(queryTerms: string[], chunkText: string, idf: Map<string, number>): number {
  const chunkTerms = tokenize(chunkText);
  if (chunkTerms.length === 0) return 0;

  const chunkTermCounts = new Map<string, number>();
  for (const term of chunkTerms) {
    chunkTermCounts.set(term, (chunkTermCounts.get(term) ?? 0) + 1);
  }

  const rawScore = queryTerms.reduce((sum, term) => {
    const termFrequency = chunkTermCounts.get(term) ?? 0;
    const inverseDocFrequency = idf.get(term) ?? 0; // terms unseen in the corpus contribute nothing
    return sum + termFrequency * inverseDocFrequency;
  }, 0);

  return rawScore / Math.sqrt(chunkTerms.length);
}
