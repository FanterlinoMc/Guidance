export const SSN_PATTERN = /\b\d{3}-\d{2}-\d{4}\b/;
export const CREDIT_CARD_PATTERN = /\b(?:\d[ -]?){13,16}\b/;
export const EMAIL_PATTERN = /\b[\w.+-]+@[\w-]+\.[a-z]{2,}\b/i;
export const PHONE_PATTERN = /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/;
export const ACCOUNT_NUMBER_PATTERN = /\baccount\s*#?\s*\d{6,}\b/i;

// Heuristic pre-filter, not a substitute for the model's own instruction-following —
// catches the common/obvious injection attempts and logs them for audit review.
export const INJECTION_PATTERNS: RegExp[] = [
  /ignore (all )?(the )?(previous|prior|above) instructions/i,
  /disregard (the )?(system prompt|previous instructions)/i,
  /reveal (your |the )?(system prompt|instructions)/i,
  /you are now/i,
  /pretend (you are|to be)/i,
  /act as if you (are|were)/i,
  /jailbreak/i,
];

const RATE_TERM = "(rates?|apr|interest)";
export const RATE_QUOTE_PATTERN = new RegExp(
  `\\d{1,2}(\\.\\d{1,3})?\\s?%.{0,30}\\b${RATE_TERM}\\b|\\b${RATE_TERM}\\b.{0,30}\\d{1,2}(\\.\\d{1,3})?\\s?%`,
  "i",
);
export const APPROVAL_GUARANTEE_PATTERN = /\b(guarantee(d)?|you will (qualify|be approved)|100%\s?approv\w*)\b/i;

// Must co-occur with a certainty/promise term, not just "close(s/d/ing) in N days" alone —
// that bare phrasing also covers the prompt's explicitly permitted informational citation
// ("most loans close in 45 days on average"). Originally missed the "-ing" form entirely
// (only matched close/closes/closed) and required the exact phrase "guaranteed closing",
// so "we guarantee closing in 30 days" slipped through unblocked — found via the guardrail
// eval suite (tests/evals/guardrails.eval.ts).
const CLOSING_CERTAINTY_TERM = "(guarantee(d|s)?|promise(d|s)?|definitely|100%|for sure)";
export const CLOSING_GUARANTEE_PATTERN = new RegExp(
  `\\b${CLOSING_CERTAINTY_TERM}\\b[^.?!]{0,50}\\bclos(e|es|ed|ing)\\b|\\bclos(e|es|ed|ing)\\b[^.?!]{0,50}\\b${CLOSING_CERTAINTY_TERM}\\b`,
  "i",
);
