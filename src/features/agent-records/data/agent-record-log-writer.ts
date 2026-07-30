import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { resolveWritableDataDir } from "@/core/storage/resolve-writable-data-dir";
import type { AgentRecord } from "../logic/types";

const LOG_DIR = resolveWritableDataDir("agent-records");
const LOG_FILE = path.join(LOG_DIR, "agent-records.jsonl");

export async function appendAgentRecordLine(record: AgentRecord): Promise<void> {
  await mkdir(LOG_DIR, { recursive: true });
  await appendFile(LOG_FILE, `${JSON.stringify(record)}\n`, "utf8");
}
