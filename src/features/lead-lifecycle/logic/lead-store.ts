import type { Lead } from "./types";

// In-memory stand-in for Step 7's real Postgres/Supabase table -- same "swap the body, not the
// signature" pattern as retrieval's TF-IDF stub. The durable history lives in
// stage-events.jsonl; this is just the current-stage cache read/written on each transition.
const leads = new Map<string, Lead>();

export function saveLead(lead: Lead): void {
  leads.set(lead.id, lead);
}

export function getLead(leadId: string): Lead | undefined {
  return leads.get(leadId);
}
