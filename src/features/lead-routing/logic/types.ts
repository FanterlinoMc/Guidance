// RECONCILED 2026-07-22 against the now-ingested "2025 Concierge Process Overview" and "GHS
// Agent Assignment Guide" -- the 1hr/3hr numbers turned out to already match that doc's "AE
// Response Time Guidelines" (TBD-Pre Approved Leads: 1hr, PQ Completed Leads: 3hr), but the
// *axis* this code splits on (lead.track: homebuyer vs. agent) is NOT the axis the doc uses
// (CRM status: TBD-Pre-Approved vs. PQ-Completed, both within the homebuyer/REA-referral
// flow -- the doc's SLA doesn't apply to agent-recruit leads at all). Our LeadStage enum
// (src/features/lead-lifecycle/logic/types.ts) has no TBD-Pre-Approved or PQ-Completed stage
// to map onto, so re-keying this by stage instead of track would mean guessing which of
// "qualified"/"captured" corresponds to which CRM status -- unverified, so not done here.
// There's also a second, different timer in the Agent Assignment Guide ("Concierge Follow Up
// Process": 2hr after TBD'd, 2hr after PQ Completed) that this code doesn't model at all.
// Left as fast/standard-by-track since it's the only axis the current data model supports;
// flagged in Notion Step 35 for a real fix once LeadStage can represent the doc's CRM statuses.
export type SlaTier = "fast" | "standard";

export interface SlaDeadline {
  leadId: string;
  tier: SlaTier;
  dueBy: string;
}
