import { logEvent } from "@/features/audit-log";
import type { SlaDeadline } from "./types";
import { isSlaBreached } from "./compute-sla-deadline";

// Stands in for "missed SLA auto-reassigns" (Notion Step 35): detects the breach and logs it
// for whoever owns reassignment to act on. Doesn't pick a new assignee from a live AE
// roster/queue -- that roster doesn't exist yet (needs Step 7's DB + real dashboard sessions),
// so faking a reassignment target would be inventing data this codebase has no source for.
export async function handleSlaBreach(deadline: SlaDeadline, now: Date = new Date()): Promise<boolean> {
  const breached = isSlaBreached(deadline, now);
  if (breached) {
    await logEvent("SLA_BREACHED", { leadId: deadline.leadId, tier: deadline.tier, dueBy: deadline.dueBy });
  }
  return breached;
}
