import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { resolveWritableDataDir } from "@/core/storage/resolve-writable-data-dir";

const LOG_DIR = resolveWritableDataDir("leads");
const LOG_FILE = path.join(LOG_DIR, "stage-events.jsonl");

export async function appendStageEventLine(record: unknown): Promise<void> {
  await mkdir(LOG_DIR, { recursive: true });
  await appendFile(LOG_FILE, `${JSON.stringify(record)}\n`, "utf8");
}
