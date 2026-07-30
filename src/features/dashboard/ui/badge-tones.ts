import type { AgentApplicationStatus } from "@/features/agent-records";
import type { LeadStage } from "@/features/lead-lifecycle";
import type { BadgeTone } from "./Badge";

export function stageTone(stage: LeadStage): BadgeTone {
  if (stage === "closed" || stage === "approved") return "success";
  if (stage === "visitor" || stage === "engaged") return "neutral";
  return "progress";
}

export function agentStatusTone(status: AgentApplicationStatus): BadgeTone {
  if (status === "onboarded" || status === "approved") return "success";
  if (status === "rejected") return "danger";
  if (status === "applied") return "neutral";
  return "progress";
}
