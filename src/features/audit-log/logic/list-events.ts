import { readAuditLines } from "../data/jsonl-reader";
import type { AuditEvent } from "./log-event";
import type { AuditReasonCode } from "./reason-codes";

export interface ListAuditEventsOptions {
  reasonCode?: AuditReasonCode;
  sessionId?: string;
  limit?: number;
}

const DEFAULT_LIMIT = 100;

export async function listAuditEvents(options: ListAuditEventsOptions = {}): Promise<AuditEvent[]> {
  const { reasonCode, sessionId, limit = DEFAULT_LIMIT } = options;

  const events = await readAuditLines();
  return events
    .filter((event) => !reasonCode || event.reasonCode === reasonCode)
    .filter((event) => !sessionId || event.sessionId === sessionId)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, limit);
}
