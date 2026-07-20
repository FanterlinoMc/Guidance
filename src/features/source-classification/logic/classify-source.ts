import type { SourceClassification, SourceType } from "./types";

// Default-deny (guardrail #5 / LLM02): every source type must be explicitly mapped here to
// reach any visibility above "internal". Scraped marketing pages are the only source in the
// corpus today, so this is the only branch actually exercised in production — the
// "internal-doc" branch is real, tested logic (see source-classification-check.ts) sitting
// ready for Step 9.1, not a stub.
export function classifySource(sourceType: SourceType): SourceClassification {
  switch (sourceType) {
    case "public-web":
      return { sourceType, visibility: "public", audience: "consumer" };
    case "internal-doc":
      return { sourceType, visibility: "internal", audience: "staff" };
  }
}
