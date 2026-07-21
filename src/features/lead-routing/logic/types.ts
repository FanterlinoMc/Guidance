// PROVISIONAL: the 1hr/3hr split by track is reconstructed, not sourced from the vault's "2025
// Concierge process" doc (unreachable while building this) -- homebuyer leads get the tighter
// window on the general mortgage-lead-gen premise that consumer leads cool off fast; agent/REA
// applications are a slower recruiting funnel. Reconcile against the vault once reachable.
export type SlaTier = "fast" | "standard";

export interface SlaDeadline {
  leadId: string;
  tier: SlaTier;
  dueBy: string;
}
