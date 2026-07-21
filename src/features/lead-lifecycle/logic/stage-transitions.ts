import { LEAD_STAGES, type LeadStage } from "./types";

// The funnel is monotonic: a lead can advance to any later stage (skipping intermediate ones
// is fine -- e.g. a visitor who submits contact info immediately jumps visitor -> captured) but
// never regresses. Stage correction, if ever needed, should read as a new lead record, not a
// backward transition -- that keeps stage_events an honest append-only history for the funnel
// view (Step 38) and SLA timers (Step 35).
export function isValidStageTransition(fromStage: LeadStage | null, toStage: LeadStage): boolean {
  if (fromStage === null) return true;
  return LEAD_STAGES.indexOf(toStage) > LEAD_STAGES.indexOf(fromStage);
}
