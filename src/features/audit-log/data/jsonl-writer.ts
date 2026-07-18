import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";

const LOG_DIR = path.join(process.cwd(), "data", "audit");
const LOG_FILE = path.join(LOG_DIR, "audit-log.jsonl");

export async function appendAuditLine(record: unknown): Promise<void> {
  await mkdir(LOG_DIR, { recursive: true });
  await appendFile(LOG_FILE, `${JSON.stringify(record)}\n`, "utf8");
}
