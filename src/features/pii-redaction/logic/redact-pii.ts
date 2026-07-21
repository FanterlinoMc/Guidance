import {
  DOCUMENT_ACCOUNT_NUMBER_PATTERN,
  DOCUMENT_CREDIT_CARD_PATTERN,
  DOCUMENT_EMAIL_PATTERN,
  DOCUMENT_PHONE_PATTERN,
  DOCUMENT_SSN_PATTERN,
} from "./document-pii-patterns";

const REDACTIONS: Array<{ pattern: RegExp; replacement: string }> = [
  { pattern: DOCUMENT_EMAIL_PATTERN, replacement: "[REDACTED-EMAIL]" },
  { pattern: DOCUMENT_SSN_PATTERN, replacement: "[REDACTED-SSN]" },
  { pattern: DOCUMENT_CREDIT_CARD_PATTERN, replacement: "[REDACTED-CARD]" },
  { pattern: DOCUMENT_ACCOUNT_NUMBER_PATTERN, replacement: "[REDACTED-ACCOUNT]" },
  { pattern: DOCUMENT_PHONE_PATTERN, replacement: "[REDACTED-PHONE]" },
];

// Masks PII in ingested-document text before it can reach the vector index (Step 9.3) — the
// raw copy stays only in the access-controlled document store. Not yet wired to a real
// ingestion pipeline: Step 9.1 (internal SOP/fatwa ingestion) has no document source available
// in this environment, so this is verified against synthetic text (pii-redaction-check.ts),
// not real Guidance documents.
export function redactPii(text: string): string {
  return REDACTIONS.reduce((redacted, { pattern, replacement }) => redacted.replace(pattern, replacement), text);
}
