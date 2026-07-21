import type { ExtractedLeadFields } from "./types";

// A field only appears in `incoming` when this turn's message actually matched it, so a later
// non-empty value always wins without needing an explicit "was this set" check.
export function mergeLeadFields(existing: ExtractedLeadFields, incoming: ExtractedLeadFields): ExtractedLeadFields {
  return { ...existing, ...incoming };
}
