import type { SourceVisibility } from "@/features/source-classification";

// Generic over the item shape so both retrieveContext()'s CorpusChunk candidates and
// source-classification-check.ts's synthetic test chunks exercise this exact function —
// the default-deny gate is proven against a non-public case, not just assumed correct.
export function filterByVisibility<T>(
  items: T[],
  getVisibility: (item: T) => SourceVisibility,
  allowedVisibility: SourceVisibility[],
): T[] {
  return items.filter((item) => allowedVisibility.includes(getVisibility(item)));
}
