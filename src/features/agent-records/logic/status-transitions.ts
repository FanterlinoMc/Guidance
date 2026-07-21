import type { AgentApplicationStatus } from "./types";

const TERMINAL_STATUSES: AgentApplicationStatus[] = ["onboarded", "rejected"];

// "rejected" is reachable from any non-terminal status (screening can fail at any point);
// everything else follows the linear applied -> screening -> approved -> onboarded path.
const FORWARD_PATH: AgentApplicationStatus[] = ["applied", "screening", "approved", "onboarded"];

export function isValidStatusTransition(from: AgentApplicationStatus, to: AgentApplicationStatus): boolean {
  if (TERMINAL_STATUSES.includes(from)) return false;
  if (to === "rejected") return true;
  return FORWARD_PATH.indexOf(to) > FORWARD_PATH.indexOf(from);
}
