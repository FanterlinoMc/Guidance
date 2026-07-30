import { readFile } from "node:fs/promises";
import path from "node:path";
import { resolveWritableDataDir } from "@/core/storage/resolve-writable-data-dir";
import type { AgentRecord } from "../logic/types";

const LOG_FILE = path.join(resolveWritableDataDir("agent-records"), "agent-records.jsonl");

export async function readAgentRecordLines(): Promise<AgentRecord[]> {
  let contents: string;
  try {
    contents = await readFile(LOG_FILE, "utf8");
  } catch {
    return [];
  }

  return contents
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line) as AgentRecord);
}
