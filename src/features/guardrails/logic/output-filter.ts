import { ALLOW, type GuardrailResult } from "./types";
import {
  APPROVAL_GUARANTEE_PATTERN,
  CLOSING_GUARANTEE_PATTERN,
  RATE_QUOTE_PATTERN,
  SSN_PATTERN,
} from "./patterns";

const FALLBACK_MESSAGE =
  "Let me connect you with an Account Executive who can give you specifics on that.";

const VIOLATION_PATTERNS = [RATE_QUOTE_PATTERN, APPROVAL_GUARANTEE_PATTERN, CLOSING_GUARANTEE_PATTERN, SSN_PATTERN];

// Defense-in-depth on top of the system prompt's own prohibitions — catches
// cases where the model slips past its instructions before the reply ships.
export function checkOutput(message: string): GuardrailResult {
  const violated = VIOLATION_PATTERNS.some((pattern) => pattern.test(message));
  if (!violated) return ALLOW;

  return { allowed: false, reasonCode: "GUARDRAIL_TRIGGERED", refusalMessage: FALLBACK_MESSAGE };
}
