import { readFile } from "node:fs/promises";
import path from "node:path";
import { resolveWritableDataDir } from "@/core/storage/resolve-writable-data-dir";
import type { StageEvent } from "../logic/types";

const LOG_FILE = path.join(resolveWritableDataDir("leads"), "stage-events.jsonl");

// Counterpart to stage-event-writer.ts's append-only log -- reads it back for the dashboard's
// lead detail view. Same "no rows yet" reality as every other JSONL-backed reader here: on
// Vercel this only sees what the current /tmp instance has written since its last cold start.
export async function listStageEvents(leadId?: string): Promise<StageEvent[]> {
  const events = await readStageEventLines();
  return leadId ? events.filter((event) => event.leadId === leadId) : events;
}

async function readStageEventLines(): Promise<StageEvent[]> {
  let contents: string;
  try {
    contents = await readFile(LOG_FILE, "utf8");
  } catch {
    return [];
  }

  return contents
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line) as StageEvent)
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}
