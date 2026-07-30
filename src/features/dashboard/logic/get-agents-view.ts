import { listAgentRecords } from "@/features/agent-records";
import { requiresVeto } from "@/features/lead-routing";
import type { AgentRow } from "./types";

export async function getAgentsView(): Promise<AgentRow[]> {
  const records = await listAgentRecords();
  return records
    .map((record) => ({ ...record, needsVeto: requiresVeto(record) }))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
