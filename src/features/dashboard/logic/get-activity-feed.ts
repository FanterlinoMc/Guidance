import { listAuditEvents } from "@/features/audit-log";
import type { ActivityRow } from "./types";

const DEFAULT_ACTIVITY_LIMIT = 50;

export async function getActivityFeed(limit: number = DEFAULT_ACTIVITY_LIMIT): Promise<ActivityRow[]> {
  return listAuditEvents({ limit });
}
