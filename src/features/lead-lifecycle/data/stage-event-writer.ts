import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";

const LOG_DIR = path.join(process.cwd(), "data", "leads");
const LOG_FILE = path.join(LOG_DIR, "stage-events.jsonl");

export async function appendStageEventLine(record: unknown): Promise<void> {
  await mkdir(LOG_DIR, { recursive: true });
  await appendFile(LOG_FILE, `${JSON.stringify(record)}\n`, "utf8");
}
