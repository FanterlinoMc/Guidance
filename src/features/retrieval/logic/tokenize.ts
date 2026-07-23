// Common English words that appear in almost every chunk and would otherwise dominate the
// term-overlap score without signaling relevance.
const STOPWORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "can", "do", "does", "for", "from", "how",
  "i", "in", "is", "it", "of", "on", "or", "our", "so", "that", "the", "their", "there", "this",
  "to", "we", "what", "when", "where", "which", "who", "will", "with", "you", "your",
]);

// Unicode-aware (\p{L}\p{N}, not [a-z0-9]) so a query in Arabic/Urdu/Bengali/etc. still produces
// tokens instead of silently matching zero characters and short-circuiting retrieveContext() to
// an empty result (queryTerms.length === 0 -- see retrieve-context.ts). This corpus is still
// English-only lexical text, so it doesn't give real cross-lingual semantic matching -- that's
// blocked on embeddings same as score-chunk.ts's NOTE -- but it does let a non-English query still
// match wherever the corpus and the query share a literal term, which happens often here since
// Islamic-finance loanwords ("Musharakah Mutanaqisa", "Guidance Residential") and numbers commonly
// stay untranslated across languages, as seen in the live multilingual eval replies.
export function tokenize(text: string): string[] {
  const words = text.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
  return words.filter((word) => !STOPWORDS.has(word));
}
