import { randomUUID } from "node:crypto";
import { saveAgentRecord } from "./agent-record-store";
import type { AgentRecord } from "./types";

export interface CreateAgentRecordInput {
  leadId: string;
  licenseNumber: string;
  licenseState: string;
  isPartTime: boolean;
}

export async function createAgentRecord(input: CreateAgentRecordInput): Promise<AgentRecord> {
  const now = new Date().toISOString();
  const record: AgentRecord = {
    id: randomUUID(),
    status: "applied",
    createdAt: now,
    updatedAt: now,
    ...input,
  };

  await saveAgentRecord(record);
  return record;
}
