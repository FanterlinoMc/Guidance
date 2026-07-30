import { randomUUID } from "node:crypto";
import { appendStageEventLine } from "../data/stage-event-writer";
import { saveLead } from "./lead-store";
import type { Lead, LeadTrack } from "./types";

export async function createLead(sessionId: string, track: LeadTrack): Promise<Lead> {
  const now = new Date().toISOString();
  const lead: Lead = {
    id: randomUUID(),
    sessionId,
    track,
    stage: "visitor",
    createdAt: now,
    updatedAt: now,
  };

  await saveLead(lead);
  await appendStageEventLine({ id: randomUUID(), leadId: lead.id, fromStage: null, toStage: "visitor", timestamp: now });

  return lead;
}
