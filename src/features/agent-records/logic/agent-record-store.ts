import { appendAgentRecordLine } from "../data/agent-record-log-writer";
import { readAgentRecordLines } from "../data/agent-record-log-reader";
import type { AgentRecord } from "./types";

// Append-only JSONL + last-write-wins-on-read -- same pattern and same reason as
// lead-lifecycle/logic/lead-store.ts (see its comment): an in-memory Map isn't readable across
// Next.js route boundaries, which a dashboard reading what /api/chat wrote needs.
export async function saveAgentRecord(record: AgentRecord): Promise<void> {
  await appendAgentRecordLine(record);
}

export async function getAgentRecord(id: string): Promise<AgentRecord | undefined> {
  const records = await listAgentRecords();
  return records.find((record) => record.id === id);
}

export async function listAgentRecords(): Promise<AgentRecord[]> {
  const lines = await readAgentRecordLines();
  const latestById = new Map<string, AgentRecord>();
  for (const record of lines) latestById.set(record.id, record);
  return Array.from(latestById.values());
}
