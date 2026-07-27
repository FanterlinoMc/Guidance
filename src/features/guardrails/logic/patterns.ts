// NOTE (Step 29/30): every pattern below is English-only. The system prompt instructs Claude
// to reply in the visitor's detected language (src/features/system-prompt), so these code-level
// checks are NOT a real defense-in-depth layer for a rate quote, approval guarantee, etc.
// phrased in Arabic/Urdu/Bengali/Somali/French -- only the prompt-level instruction covers
// those today. Real multilingual patterns need translations vetted by a fluent speaker per
// language; that's Step 30's "Multilingual test suite (EN, AR, UR, BN, SO, FR)", not guessed
// here.
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

// Catches the model disclosing GHS's referral-fee arrangement with agents even when it isn't
// grounded in retrieved context (i.e. stated from general real-estate-industry knowledge) --
// the system prompt's own prohibition against this isn't reliable enough on its own, since this
// is common industry knowledge the model can produce unprompted (see Adam's 2026-07-27 note:
// referral-fee terms are fine to discuss with a verified agent, never with a customer). Exported
// as three components rather than one combined regex -- output-filter.ts checks them per
// sentence, since a single "fee ... agent" pattern with a bounded gap kept missing real phrasings
// ("a fee from the real estate agent/broker") that put more words between the terms than a fixed
// character budget could predict.
export const REFERRAL_FEE_PHRASE_PATTERN = /\breferral fee\b/i;
export const FEE_OR_COMMISSION_TERM_PATTERN = /\b(fee|commission)s?\b/i;
export const AGENT_OR_BROKER_TERM_PATTERN = /\b(agent|broker|realtor)s?\b/i;
export const COMPENSATION_VERB_PATTERN = /\b(receiv\w*|pay|pays|paid|compensat\w*)\b/i;

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
