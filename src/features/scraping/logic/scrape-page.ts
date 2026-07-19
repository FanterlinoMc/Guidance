import * as cheerio from "cheerio";
import { extractPage } from "./extract-sections";
import type { ScrapedPage, SeedPage } from "./types";

export async function scrapePage(
  baseUrl: string,
  entity: string,
  page: SeedPage,
): Promise<ScrapedPage> {
  const url = new URL(page.path, baseUrl).toString();
  const res = await fetch(url, {
    headers: { "User-Agent": "GuidanceChatbotScraper/1.0 (+RAG corpus build)" },
  });
  if (!res.ok) {
    throw new Error(`Fetch failed for ${url}: ${res.status} ${res.statusText}`);
  }

  const $ = cheerio.load(await res.text());
  const { title, sections } = extractPage($);
  return { url, entity, title, sections };
}
