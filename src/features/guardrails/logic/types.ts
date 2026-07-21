import type { AuditReasonCode } from "@/features/audit-log";

export interface GuardrailResult {
  allowed: boolean;
  reasonCode?: Extract<AuditReasonCode, "PII_DETECTED" | "GUARDRAIL_TRIGGERED" | "INTERNAL_CONTENT_LEAK_BLOCKED">;
  refusalMessage?: string;
}

export const ALLOW: GuardrailResult = { allowed: true };
