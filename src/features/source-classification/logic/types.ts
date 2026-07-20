// Only "public-web" is populated today (Step 9, the scraper). "internal-doc" exists so
// classifySource() has a real branch ready for Step 9.1 (internal SOP/fatwa ingestion)
// without redesigning the type once that source lands.
export type SourceType = "public-web" | "internal-doc";

export type SourceVisibility = "public" | "agent" | "internal";
export type SourceAudience = "consumer" | "agent" | "staff";

export interface SourceClassification {
  sourceType: SourceType;
  visibility: SourceVisibility;
  audience: SourceAudience;
}
