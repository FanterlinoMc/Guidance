import { ALLOW, type GuardrailResult } from "./types";
import { CREDIT_CARD_PATTERN, INJECTION_PATTERNS, SSN_PATTERN } from "./patterns";

const PII_REFUSAL =
  "I can't accept SSNs, account numbers, or other sensitive identifiers in chat. " +
  "Please use the secure pre-qualification form instead.";

const INJECTION_REFUSAL =
  "I can only help with questions about Guidance Home Services financing.";

export function checkInput(message: string): GuardrailResult {
  if (SSN_PATTERN.test(message) || CREDIT_CARD_PATTERN.test(message)) {
    return { allowed: false, reasonCode: "PII_DETECTED", refusalMessage: PII_REFUSAL };
  }

  if (INJECTION_PATTERNS.some((pattern) => pattern.test(message))) {
    return { allowed: false, reasonCode: "GUARDRAIL_TRIGGERED", refusalMessage: INJECTION_REFUSAL };
  }

  return ALLOW;
}
