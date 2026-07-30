import type { AgentApplicationStatus } from "@/features/agent-records";
import { listAgentRecords } from "@/features/agent-records";
import { listAuditEvents } from "@/features/audit-log";
import { LEAD_STAGES, listLeads } from "@/features/lead-lifecycle";
import type { OverviewStats } from "./types";

const RECENT_ACTIVITY_LIMIT = 10;
const SLA_BREACH_WINDOW_HOURS = 24;

// Display order only -- status-transitions.ts owns the actual transition rules.
const AGENT_STATUS_DISPLAY_ORDER: AgentApplicationStatus[] = [
  "applied",
  "screening",
  "approved",
  "onboarded",
  "rejected",
];

export async function getOverviewStats(): Promise<OverviewStats> {
  const [leads, agentRecords, recentActivity, slaBreaches] = await Promise.all([
    listLeads(),
    listAgentRecords(),
    listAuditEvents({ limit: RECENT_ACTIVITY_LIMIT }),
    listAuditEvents({ reasonCode: "SLA_BREACHED" }),
  ]);

  const breachWindowStart = Date.now() - SLA_BREACH_WINDOW_HOURS * 60 * 60 * 1000;

  return {
    totalLeads: leads.length,
    stageCounts: LEAD_STAGES.map((stage) => ({
      stage,
      count: leads.filter((lead) => lead.stage === stage).length,
    })),
    totalAgentApplications: agentRecords.length,
    agentStatusCounts: AGENT_STATUS_DISPLAY_ORDER.map((status) => ({
      status,
      count: agentRecords.filter((record) => record.status === status).length,
    })),
    slaBreachesLast24h: slaBreaches.filter(
      (event) => new Date(event.timestamp).getTime() >= breachWindowStart,
    ).length,
    recentActivity,
  };
}
