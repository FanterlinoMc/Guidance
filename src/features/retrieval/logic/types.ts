import type { SourceAudience, SourceVisibility } from "@/features/source-classification";

export interface RetrievedChunk {
  id: string;
  text: string;
  url: string;
  entity: "home-services" | "residential" | "investments";
  title?: string;
  section?: string;
  visibility: SourceVisibility;
  audience: SourceAudience;
}
