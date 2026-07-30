import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { resolveWritableDataDir } from "@/core/storage/resolve-writable-data-dir";
import type { Lead } from "../logic/types";

const LOG_DIR = resolveWritableDataDir("leads");
const LOG_FILE = path.join(LOG_DIR, "leads.jsonl");

export async function appendLeadLine(lead: Lead): Promise<void> {
  await mkdir(LOG_DIR, { recursive: true });
  await appendFile(LOG_FILE, `${JSON.stringify(lead)}\n`, "utf8");
}
