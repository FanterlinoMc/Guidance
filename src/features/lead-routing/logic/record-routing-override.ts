import type { DashboardRole } from "@/features/dashboard-auth";
import { logEvent } from "@/features/audit-log";

// A DM (or above) overriding an auto-routing decision -- e.g. approving a sub-7-score REA
// application after manual review. No permission check here: Step 5's RBAC permission matrix
// is explicitly deferred (no auth provider to enforce it against yet), so this only records
// the override for audit purposes rather than pretending to gate who's allowed to call it.
export async function recordRoutingOverride(leadId: string, overriddenBy: DashboardRole, reason: string): Promise<void> {
  await logEvent("ROUTING_OVERRIDDEN", { leadId, overriddenBy, reason });
}
