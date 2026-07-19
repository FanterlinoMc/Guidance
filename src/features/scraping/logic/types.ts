export type SeedPage = { path: string };

export type SeedSite = {
  entity: string;
  baseUrl: string;
  status: string;
  pages: SeedPage[];
};

export type PageSection = { heading: string; text: string };

export type ScrapedPage = {
  url: string;
  entity: string;
  title: string;
  sections: PageSection[];
};

export type CorpusChunk = {
  id: string;
  entity: string;
  url: string;
  title: string;
  section: string;
  text: string;
  tokenEstimate: number;
};
