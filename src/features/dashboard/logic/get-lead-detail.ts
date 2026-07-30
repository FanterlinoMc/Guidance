import { getCapturedFields } from "@/features/lead-extraction";
import { getLead, listStageEvents } from "@/features/lead-lifecycle";
import type { LeadDetail } from "./types";

export async function getLeadDetail(leadId: string): Promise<LeadDetail | undefined> {
  const lead = await getLead(leadId);
  if (!lead) return undefined;

  const [stageEvents, capturedFields] = await Promise.all([listStageEvents(leadId), getCapturedFields(leadId)]);

  return {
    ...lead,
    ...capturedFields,
    stageHistory: stageEvents.map(({ fromStage, toStage, timestamp }) => ({ fromStage, toStage, timestamp })),
  };
}
