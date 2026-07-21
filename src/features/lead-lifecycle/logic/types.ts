// PROVISIONAL: the Obsidian vault plan (Floorzero/.../Lead-Lifecycle/00-plan.md) is the
// authoritative source for the exact 10-stage list and wasn't reachable while building this
// (local REST API was down). This stage set is reconstructed from what's already in the
// codebase -- the funnel view's "Visitor -> Closed" endpoints (Step 38), the consumer flow's
// educate -> offer AE -> capture (Step 26), and the agent/REA flow's explain -> screen ->
// capture (Step 27) -- plus standard mortgage/recruiting funnel conventions. Reconcile against
// the vault once it's reachable; nothing persists to a real DB yet (Step 7 blocked), so
// relabeling this later is cheap.
export type LeadStage =
  | "visitor"
  | "engaged"
  | "qualified"
  | "captured"
  | "ae-assigned"
  | "contacted"
  | "application-started"
  | "application-in-review"
  | "approved"
  | "closed";

export const LEAD_STAGES: LeadStage[] = [
  "visitor",
  "engaged",
  "qualified",
  "captured",
  "ae-assigned",
  "contacted",
  "application-started",
  "application-in-review",
  "approved",
  "closed",
];

export type LeadTrack = "homebuyer" | "agent";

export interface Lead {
  id: string;
  sessionId: string;
  track: LeadTrack;
  stage: LeadStage;
  createdAt: string;
  updatedAt: string;
}

export interface StageEvent {
  id: string;
  leadId: string;
  fromStage: LeadStage | null;
  toStage: LeadStage;
  timestamp: string;
  detail?: Record<string, unknown>;
}
