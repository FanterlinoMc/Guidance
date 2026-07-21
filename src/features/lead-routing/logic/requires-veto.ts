import type { AgentRecord } from "@/features/agent-records";

// Per Notion Step 35: score < 7 requires a human veto/override before a REA application can
// advance. An unscored applicant (score not yet set during screening) is not auto-vetoed --
// there's simply no score to compare yet.
const VETO_SCORE_THRESHOLD = 7;

export function requiresVeto(agentRecord: AgentRecord): boolean {
  return agentRecord.score !== undefined && agentRecord.score < VETO_SCORE_THRESHOLD;
}
