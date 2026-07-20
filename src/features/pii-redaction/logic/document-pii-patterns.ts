import { CREDIT_CARD_PATTERN, SSN_PATTERN } from "@/features/guardrails";

// Email and phone are common in internal SOPs/agent docs but never checked by the chat-input
// guardrails (src/features/guardrails), which only need to catch what a customer might paste
// into a chat box, so they're new here. SSN and credit-card detection are the same source of
// truth as guardrails, just re-flagged "g" — redaction must replace every match, not just
// detect the first one.
export const EMAIL_PATTERN = /\b[\w.+-]+@[\w-]+\.[a-z]{2,}\b/gi;
export const PHONE_PATTERN = /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g;
export const ACCOUNT_NUMBER_PATTERN = /\baccount\s*#?\s*\d{6,}\b/gi;
export const DOCUMENT_SSN_PATTERN = new RegExp(SSN_PATTERN.source, "g");
export const DOCUMENT_CREDIT_CARD_PATTERN = new RegExp(CREDIT_CARD_PATTERN.source, "g");
