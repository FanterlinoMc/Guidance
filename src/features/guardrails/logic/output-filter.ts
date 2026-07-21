import type { RetrievedChunk } from "@/features/retrieval";
import { detectInternalContentLeak } from "./detect-internal-leak";
import { ALLOW, type GuardrailResult } from "./types";
import {
  ACCOUNT_NUMBER_PATTERN,
  APPROVAL_GUARANTEE_PATTERN,
  CLOSING_GUARANTEE_PATTERN,
  CREDIT_CARD_PATTERN,
  EMAIL_PATTERN,
  PHONE_PATTERN,
  RATE_QUOTE_PATTERN,
  SSN_PATTERN,
} from "./patterns";

const FALLBACK_MESSAGE =
  "Let me connect you with an Account Executive who can give you specifics on that.";

const LEAK_MESSAGE =
  "Let me connect you with an Account Executive who can help with that.";

// Step 16.1: PII patterns catch a model reply that echoes back sensitive identifiers (its own
// or ones the visitor pasted in). CREDIT_CARD_PATTERN, EMAIL_PATTERN, PHONE_PATTERN, and
// ACCOUNT_NUMBER_PATTERN were missing here even though CREDIT_CARD_PATTERN already existed for
// input checking — output was only ever checked for SSNs.
const VIOLATION_PATTERNS = [
  RATE_QUOTE_PATTERN,
  APPROVAL_GUARANTEE_PATTERN,
  CLOSING_GUARANTEE_PATTERN,
  SSN_PATTERN,
  CREDIT_CARD_PATTERN,
  EMAIL_PATTERN,
  PHONE_PATTERN,
  ACCOUNT_NUMBER_PATTERN,
];

// Defense-in-depth on top of the system prompt's own prohibitions — catches
// cases where the model slips past its instructions before the reply ships.
// retrievedChunks is optional so callers without RAG context (e.g. a static refusal message)
// don't need to pass anything; it's required to actually catch a leaked internal excerpt.
export function checkOutput(message: string, retrievedChunks: RetrievedChunk[] = []): GuardrailResult {
  if (detectInternalContentLeak(message, retrievedChunks)) {
    return { allowed: false, reasonCode: "INTERNAL_CONTENT_LEAK_BLOCKED", refusalMessage: LEAK_MESSAGE };
  }

  const violated = VIOLATION_PATTERNS.some((pattern) => pattern.test(message));
  if (!violated) return ALLOW;

  return { allowed: false, reasonCode: "GUARDRAIL_TRIGGERED", refusalMessage: FALLBACK_MESSAGE };
}
