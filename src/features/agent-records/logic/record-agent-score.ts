import { AppError } from "@/core/errors/app-error";
import { getAgentRecord, saveAgentRecord } from "./agent-record-store";
import type { AgentRecord } from "./types";

const MIN_SCORE = 0;
const MAX_SCORE = 10;

export function recordAgentScore(agentRecordId: string, score: number): AgentRecord {
  const record = getAgentRecord(agentRecordId);
  if (!record) {
    throw new AppError("INVALID_REQUEST", `No agent record found for id ${agentRecordId}.`, 404);
  }
  if (score < MIN_SCORE || score > MAX_SCORE) {
    throw new AppError("INVALID_REQUEST", `Agent score must be between ${MIN_SCORE} and ${MAX_SCORE}.`, 400);
  }

  const updated: AgentRecord = { ...record, score, updatedAt: new Date().toISOString() };
  saveAgentRecord(updated);
  return updated;
}
