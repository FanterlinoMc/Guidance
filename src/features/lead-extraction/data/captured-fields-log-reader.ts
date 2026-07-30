import { readFile } from "node:fs/promises";
import path from "node:path";
import { resolveWritableDataDir } from "@/core/storage/resolve-writable-data-dir";
import type { ExtractedLeadFields } from "../logic/types";
import type { CapturedFieldsRecord } from "./captured-fields-log-writer";

const LOG_FILE = path.join(resolveWritableDataDir("leads"), "captured-fields.jsonl");

async function readCapturedFieldsLines(): Promise<CapturedFieldsRecord[]> {
  let contents: string;
  try {
    contents = await readFile(LOG_FILE, "utf8");
  } catch {
    return [];
  }

  return contents
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line) as CapturedFieldsRecord);
}

// Each appended line already holds that lead's full merged field set (captureLeadFields merges
// before appending), so the latest line per leadId is that lead's current state -- same
// last-write-wins reduction as lead-store's listLeads().
export async function listCapturedFieldsByLead(): Promise<Map<string, ExtractedLeadFields>> {
  const lines = await readCapturedFieldsLines();
  const latestByLead = new Map<string, ExtractedLeadFields>();
  for (const record of lines) latestByLead.set(record.leadId, record.fields);
  return latestByLead;
}
