import { AppError } from "@/core/errors/app-error";
import { getAgentRecord, saveAgentRecord } from "./agent-record-store";
import { isValidStatusTransition } from "./status-transitions";
import type { AgentApplicationStatus, AgentRecord } from "./types";

export async function updateAgentStatus(agentRecordId: string, status: AgentApplicationStatus): Promise<AgentRecord> {
  const record = await getAgentRecord(agentRecordId);
  if (!record) {
    throw new AppError("INVALID_REQUEST", `No agent record found for id ${agentRecordId}.`, 404);
  }
  if (!isValidStatusTransition(record.status, status)) {
    throw new AppError(
      "INVALID_REQUEST",
      `Cannot move agent record ${agentRecordId} from "${record.status}" to "${status}".`,
      400,
    );
  }

  const updated: AgentRecord = { ...record, status, updatedAt: new Date().toISOString() };
  await saveAgentRecord(updated);
  return updated;
}
