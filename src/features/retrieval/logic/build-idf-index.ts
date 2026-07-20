import { loadCorpus } from "./load-corpus";
import { tokenize } from "./tokenize";

let cachedIdfIndex: Map<string, number> | null = null;

// Smoothed inverse document frequency: log(N / (1 + docFreq)) + 1. Without this, raw
// term-frequency scoring lets common words (e.g. "financing", appearing in most chunks) drown
// out the rare, specific terms (e.g. "musharakah") that actually distinguish a relevant chunk.
export function getIdfIndex(): Map<string, number> {
  if (cachedIdfIndex) return cachedIdfIndex;

  const corpus = loadCorpus();
  const docFrequency = new Map<string, number>();
  for (const chunk of corpus) {
    for (const term of new Set(tokenize(chunk.text))) {
      docFrequency.set(term, (docFrequency.get(term) ?? 0) + 1);
    }
  }

  cachedIdfIndex = new Map(
    [...docFrequency].map(([term, freq]) => [term, Math.log(corpus.length / (1 + freq)) + 1]),
  );
  return cachedIdfIndex;
}
