export { getOverviewStats } from "./logic/get-overview-stats";
export { getLeadsView } from "./logic/get-leads-view";
export { getLeadDetail } from "./logic/get-lead-detail";
export { getAgentsView } from "./logic/get-agents-view";
export { getActivityFeed } from "./logic/get-activity-feed";
export type {
  LeadRow,
  LeadDetail,
  StageHistoryEntry,
  AgentRow,
  ActivityRow,
  OverviewStats,
  StageCount,
  AgentStatusCount,
} from "./logic/types";

export { DashboardNav } from "./ui/DashboardNav";
export { UnauthenticatedBanner } from "./ui/UnauthenticatedBanner";
export { Badge } from "./ui/Badge";
export type { BadgeTone } from "./ui/Badge";
export { stageTone, agentStatusTone } from "./ui/badge-tones";
export { StatCard } from "./ui/StatCard";
export { FunnelBars } from "./ui/FunnelBars";
export { ActivityList } from "./ui/ActivityList";
export { LeadsTable } from "./ui/LeadsTable";
export { LeadDetailView } from "./ui/LeadDetailView";
export { AgentsTable } from "./ui/AgentsTable";
