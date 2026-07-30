import { randomUUID } from "node:crypto";
import { AppError } from "@/core/errors/app-error";
import { appendStageEventLine } from "../data/stage-event-writer";
import { getLead, saveLead } from "./lead-store";
import { isValidStageTransition } from "./stage-transitions";
import type { Lead, LeadStage } from "./types";

export async function advanceLeadStage(
  leadId: string,
  toStage: LeadStage,
  detail?: Record<string, unknown>,
): Promise<Lead> {
  const lead = await getLead(leadId);
  if (!lead) {
    throw new AppError("INVALID_REQUEST", `No lead found for id ${leadId}.`, 404);
  }
  if (!isValidStageTransition(lead.stage, toStage)) {
    throw new AppError(
      "INVALID_REQUEST",
      `Cannot move lead ${leadId} from "${lead.stage}" to "${toStage}" — stages only advance forward.`,
      400,
    );
  }

  const now = new Date().toISOString();
  const updatedLead: Lead = { ...lead, stage: toStage, updatedAt: now };
  await saveLead(updatedLead);

  await appendStageEventLine({
    id: randomUUID(),
    leadId,
    fromStage: lead.stage,
    toStage,
    timestamp: now,
    detail,
  });

  return updatedLead;
}
