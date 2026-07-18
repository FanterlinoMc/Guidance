export const SSN_PATTERN = /\b\d{3}-\d{2}-\d{4}\b/;
export const CREDIT_CARD_PATTERN = /\b(?:\d[ -]?){13,16}\b/;

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
export const CLOSING_GUARANTEE_PATTERN = /close(s|d)? in \d+ days|guaranteed closing/i;
