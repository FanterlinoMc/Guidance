import { AppError } from "@/core/errors/app-error";
import { logEvent } from "@/features/audit-log";
import { checkKbQueryLimit } from "./check-kb-query-limit";

export async function enforceKbQueryLimit(sessionId: string, query: string): Promise<void> {
  const { allowed, reason } = checkKbQueryLimit(sessionId, query);
  if (allowed) return;

  await logEvent("RETRIEVAL_ABUSE_BLOCKED", { reason }, sessionId);
  throw new AppError("RETRIEVAL_ABUSE_BLOCKED", "Too many knowledge-base queries from this session.", 429);
}
