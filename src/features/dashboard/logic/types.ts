import type { AgentApplicationStatus } from "@/features/agent-records";
import type { AuditEvent } from "@/features/audit-log";
import type { LeadStage, LeadTrack } from "@/features/lead-lifecycle";

export type ActivityRow = AuditEvent;

export interface LeadRow {
  id: string;
  sessionId: string;
  track: LeadTrack;
  stage: LeadStage;
  email?: string;
  phone?: string;
  name?: string;
  city?: string;
  timeline?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StageHistoryEntry {
  fromStage: LeadStage | null;
  toStage: LeadStage;
  timestamp: string;
}

export interface LeadDetail extends LeadRow {
  stageHistory: StageHistoryEntry[];
}

export interface AgentRow {
  id: string;
  leadId: string;
  licenseNumber: string;
  licenseState: string;
  isPartTime: boolean;
  score?: number;
  status: AgentApplicationStatus;
  needsVeto: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StageCount {
  stage: LeadStage;
  count: number;
}

export interface AgentStatusCount {
  status: AgentApplicationStatus;
  count: number;
}

export interface OverviewStats {
  totalLeads: number;
  stageCounts: StageCount[];
  totalAgentApplications: number;
  agentStatusCounts: AgentStatusCount[];
  slaBreachesLast24h: number;
  recentActivity: ActivityRow[];
}
