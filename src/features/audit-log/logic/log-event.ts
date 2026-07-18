import { randomUUID } from "node:crypto";
import { appendAuditLine } from "../data/jsonl-writer";
import type { AuditReasonCode } from "./reason-codes";

export interface AuditEvent {
  id: string;
  timestamp: string;
  reasonCode: AuditReasonCode;
  sessionId?: string;
  detail?: Record<string, unknown>;
}

export async function logEvent(
  reasonCode: AuditReasonCode,
  detail?: Record<string, unknown>,
  sessionId?: string,
): Promise<void> {
  const event: AuditEvent = {
    id: randomUUID(),
    timestamp: new Date().toISOString(),
    reasonCode,
    sessionId,
    detail,
  };
  await appendAuditLine(event);
}
