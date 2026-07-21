import { randomUUID } from "node:crypto";
import { saveAgentRecord } from "./agent-record-store";
import type { AgentRecord } from "./types";

export interface CreateAgentRecordInput {
  leadId: string;
  licenseNumber: string;
  licenseState: string;
  isPartTime: boolean;
}

export function createAgentRecord(input: CreateAgentRecordInput): AgentRecord {
  const now = new Date().toISOString();
  const record: AgentRecord = {
    id: randomUUID(),
    status: "applied",
    createdAt: now,
    updatedAt: now,
    ...input,
  };

  saveAgentRecord(record);
  return record;
}
