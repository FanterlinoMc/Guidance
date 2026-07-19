// Fetches every page listed in src/features/scraping/data/seed-sites.json, grouped by entity
// (home-services | residential | investments). All three sites are verified server-rendered, so
// plain fetch + Cheerio is sufficient — re-verify that assumption before relying on it if a new
// site is added. Writes data/scraped/guidance-corpus.json for scripts/chunk.ts to consume.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { scrapePage } from "../src/features/scraping";
import type { ScrapedPage, SeedSite } from "../src/features/scraping";

const POLITENESS_DELAY_MS = 1500;

function sleep(ms: number) {
  return new Promise((done) => setTimeout(done, ms));
}

async function main() {
  const seedPath = resolve(__dirname, "../src/features/scraping/data/seed-sites.json");
  const { sites } = JSON.parse(readFileSync(seedPath, "utf-8")) as { sites: SeedSite[] };

  const results: ScrapedPage[] = [];

  for (const site of sites) {
    if (site.pages.length === 0) {
      console.log(`Skipping entity "${site.entity}" (${site.status}) — no pages configured.`);
      continue;
    }

    console.log(`\n=== ${site.entity} (${site.baseUrl}) ===`);
    for (const page of site.pages) {
      process.stdout.write(`Scraping ${page.path} ... `);
      try {
        const scraped = await scrapePage(site.baseUrl, site.entity, page);
        const chars = scraped.sections.reduce((sum, s) => sum + s.text.length, 0);
        results.push(scraped);
        console.log(`ok (${scraped.sections.length} sections, ${chars} chars)`);
      } catch (err) {
        console.log("FAILED");
        console.error(err);
      }
      await sleep(POLITENESS_DELAY_MS);
    }
  }

  const outDir = resolve(__dirname, "../data/scraped");
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(outDir, "guidance-corpus.json");
  writeFileSync(outPath, JSON.stringify(results, null, 2), "utf-8");
  console.log(`\nWrote ${results.length} pages to ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
