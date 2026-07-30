import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { resolveWritableDataDir } from "@/core/storage/resolve-writable-data-dir";
import type { ExtractedLeadFields } from "../logic/types";

const LOG_DIR = resolveWritableDataDir("leads");
const LOG_FILE = path.join(LOG_DIR, "captured-fields.jsonl");

export interface CapturedFieldsRecord {
  leadId: string;
  fields: ExtractedLeadFields;
}

export async function appendCapturedFieldsLine(record: CapturedFieldsRecord): Promise<void> {
  await mkdir(LOG_DIR, { recursive: true });
  await appendFile(LOG_FILE, `${JSON.stringify(record)}\n`, "utf8");
}
