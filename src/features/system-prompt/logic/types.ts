export interface RetrievedChunk {
  text: string;
  url: string;
  entity: "home-services" | "residential" | "investments";
  title?: string;
  section?: string;
}
