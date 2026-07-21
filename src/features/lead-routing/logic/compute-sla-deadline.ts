import type { Lead } from "@/features/lead-lifecycle";
import type { SlaDeadline, SlaTier } from "./types";

const FAST_SLA_HOURS = 1;
const STANDARD_SLA_HOURS = 3;

export function computeSlaDeadline(lead: Lead, capturedAt: Date = new Date()): SlaDeadline {
  const tier: SlaTier = lead.track === "homebuyer" ? "fast" : "standard";
  const hours = tier === "fast" ? FAST_SLA_HOURS : STANDARD_SLA_HOURS;
  const dueBy = new Date(capturedAt.getTime() + hours * 60 * 60 * 1000);

  return { leadId: lead.id, tier, dueBy: dueBy.toISOString() };
}

export function isSlaBreached(deadline: SlaDeadline, now: Date = new Date()): boolean {
  return now.getTime() > new Date(deadline.dueBy).getTime();
}
