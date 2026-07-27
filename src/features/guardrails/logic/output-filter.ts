import type { RetrievedChunk } from "@/features/retrieval";
import { detectInternalContentLeak } from "./detect-internal-leak";
import { ALLOW, type GuardrailResult } from "./types";
import {
  ACCOUNT_NUMBER_PATTERN,
  AGENT_OR_BROKER_TERM_PATTERN,
  APPROVAL_GUARANTEE_PATTERN,
  CLOSING_GUARANTEE_PATTERN,
  COMPENSATION_VERB_PATTERN,
  CREDIT_CARD_PATTERN,
  EMAIL_PATTERN,
  FEE_OR_COMMISSION_TERM_PATTERN,
  PHONE_PATTERN,
  RATE_QUOTE_PATTERN,
  REFERRAL_FEE_PHRASE_PATTERN,
  SSN_PATTERN,
} from "./patterns";

const FALLBACK_MESSAGE =
  "Let me connect you with an Account Executive who can give you specifics on that.";

const LEAK_MESSAGE =
  "Let me connect you with an Account Executive who can help with that.";

// Guidance's own published contact addresses (e.g. reasignup@guidancehomeservices.com, which
// the system prompt tells the model to hand out to REAs signing up) aren't a PII leak -- only an
// email at some OTHER domain indicates the model echoed back a visitor's own address.
const GUIDANCE_EMAIL_DOMAIN = /@guidancehomeservices\.com\b/i;

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

  const violated =
    VIOLATION_PATTERNS.some((pattern) => pattern.test(message)) ||
    leaksNonGuidanceEmail(message) ||
    disclosesReferralFee(message);
  if (!violated) return ALLOW;

  return { allowed: false, reasonCode: "GUARDRAIL_TRIGGERED", refusalMessage: FALLBACK_MESSAGE };
}

function leaksNonGuidanceEmail(message: string): boolean {
  const match = message.match(EMAIL_PATTERN);
  return match !== null && !GUIDANCE_EMAIL_DOMAIN.test(match[0]);
}

// A fixed-width regex gap between "fee" and "agent" missed real phrasings ("a fee from the real
// estate agent/broker"), so this checks per-sentence instead: any sentence naming both a
// fee/commission and an agent/broker/realtor alongside a compensation verb is a disclosure,
// regardless of word order or how many words sit between them.
function disclosesReferralFee(message: string): boolean {
  if (REFERRAL_FEE_PHRASE_PATTERN.test(message)) return true;

  const sentences = message.split(/(?<=[.?!])\s+/);
  return sentences.some(
    (sentence) =>
      FEE_OR_COMMISSION_TERM_PATTERN.test(sentence) &&
      AGENT_OR_BROKER_TERM_PATTERN.test(sentence) &&
      COMPENSATION_VERB_PATTERN.test(sentence),
  );
}
