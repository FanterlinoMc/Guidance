import { createHash } from "node:crypto";

// Audit logs record that a query happened without retaining the raw text (PII minimization) —
// a truncated SHA-256 is enough to correlate repeated or identical queries across a session.
export function hashQuery(query: string): string {
  return createHash("sha256").update(query.trim().toLowerCase()).digest("hex").slice(0, 16);
}
