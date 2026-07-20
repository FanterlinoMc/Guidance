// Common English words that appear in almost every chunk and would otherwise dominate the
// term-overlap score without signaling relevance.
const STOPWORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "can", "do", "does", "for", "from", "how",
  "i", "in", "is", "it", "of", "on", "or", "our", "so", "that", "the", "their", "there", "this",
  "to", "we", "what", "when", "where", "which", "who", "will", "with", "you", "your",
]);

export function tokenize(text: string): string[] {
  const words = text.toLowerCase().match(/[a-z0-9]+/g) ?? [];
  return words.filter((word) => !STOPWORDS.has(word));
}
