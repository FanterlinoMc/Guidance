import {
  ACCOUNT_NUMBER_PATTERN,
  CREDIT_CARD_PATTERN,
  EMAIL_PATTERN,
  PHONE_PATTERN,
  SSN_PATTERN,
} from "@/features/guardrails";

// guardrails/logic/patterns.ts is the single source of truth for what counts as PII in this
// codebase (Step 16.1's output DLP guard uses the same patterns). Re-flagged "g" here because
// redaction must replace every match in a document, not just detect the first one like
// guardrails' .test() calls do.
export const DOCUMENT_EMAIL_PATTERN = new RegExp(EMAIL_PATTERN.source, "gi");
export const DOCUMENT_PHONE_PATTERN = new RegExp(PHONE_PATTERN.source, "g");
export const DOCUMENT_ACCOUNT_NUMBER_PATTERN = new RegExp(ACCOUNT_NUMBER_PATTERN.source, "gi");
export const DOCUMENT_SSN_PATTERN = new RegExp(SSN_PATTERN.source, "g");
export const DOCUMENT_CREDIT_CARD_PATTERN = new RegExp(CREDIT_CARD_PATTERN.source, "g");
