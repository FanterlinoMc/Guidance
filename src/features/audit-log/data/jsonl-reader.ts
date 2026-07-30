import { readFile } from "node:fs/promises";
import path from "node:path";
import { resolveWritableDataDir } from "@/core/storage/resolve-writable-data-dir";
import type { AuditEvent } from "../logic/log-event";

const LOG_FILE = path.join(resolveWritableDataDir("audit"), "audit-log.jsonl");

export async function readAuditLines(): Promise<AuditEvent[]> {
  let contents: string;
  try {
    contents = await readFile(LOG_FILE, "utf8");
  } catch {
    return [];
  }

  return contents
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line) as AuditEvent);
}
