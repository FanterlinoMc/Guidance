export type AgentApplicationStatus = "applied" | "screening" | "approved" | "onboarded" | "rejected";

export interface AgentRecord {
  id: string;
  leadId: string;
  licenseNumber: string;
  licenseState: string;
  isPartTime: boolean;
  // 0-10, feeds Step 35's veto threshold (score < 7). Set by a human reviewer during
  // screening -- no scoring formula exists to encode here, and inventing one would be a
  // business-judgment call this codebase has no basis for making.
  score?: number;
  status: AgentApplicationStatus;
  createdAt: string;
  updatedAt: string;
}
