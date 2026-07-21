import type { AgentRecord } from "./types";

// In-memory stand-in for Step 7's real table -- same pattern as lead-lifecycle's lead-store.
const agentRecords = new Map<string, AgentRecord>();

export function saveAgentRecord(record: AgentRecord): void {
  agentRecords.set(record.id, record);
}

export function getAgentRecord(id: string): AgentRecord | undefined {
  return agentRecords.get(id);
}
