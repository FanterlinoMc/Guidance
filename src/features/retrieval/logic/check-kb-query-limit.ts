import { tokenize } from "./tokenize";

const WINDOW_MS = 60 * 60 * 1000;
// Generous relative to the 30 msg/hr chat rate limit — this exists to catch a session that
// hammers retrieveContext() directly (bypassing the chat turn cadence), not to double-enforce
// the same 30/hr ceiling.
const MAX_QUERIES_PER_SESSION = 40;
const NEAR_DUPLICATE_JACCARD_THRESHOLD = 0.6;
// A real conversation asks a handful of genuinely different questions. This many
// lexically-near-identical queries in one window (e.g. one word swapped at a time) looks like
// someone enumerating chunk content rather than talking to the assistant.
const NEAR_DUPLICATE_ALERT_COUNT = 8;

interface SessionQueryHistory {
  windowStart: number;
  queryTermSets: string[][];
}

const sessionHistories = new Map<string, SessionQueryHistory>();

export type KbQueryLimitReason = "RATE_EXCEEDED" | "NEAR_DUPLICATE_PROBING";

export interface KbQueryLimitResult {
  allowed: boolean;
  reason?: KbQueryLimitReason;
}

function jaccardSimilarity(a: string[], b: string[]): number {
  const setA = new Set(a);
  const setB = new Set(b);
  if (setA.size === 0 || setB.size === 0) return 0;

  const intersectionSize = [...setA].filter((term) => setB.has(term)).length;
  const unionSize = new Set([...setA, ...setB]).size;
  return intersectionSize / unionSize;
}

// Guards retrieveContext() against corpus harvesting via a rolling per-session window: a
// volume cap, plus a near-duplicate check so the KB can't be scraped by many crafted
// variations of the same question.
export function checkKbQueryLimit(sessionId: string, query: string): KbQueryLimitResult {
  const now = Date.now();
  const history = sessionHistories.get(sessionId) ?? { windowStart: now, queryTermSets: [] };

  if (now - history.windowStart >= WINDOW_MS) {
    history.windowStart = now;
    history.queryTermSets = [];
  }

  if (history.queryTermSets.length >= MAX_QUERIES_PER_SESSION) {
    return { allowed: false, reason: "RATE_EXCEEDED" };
  }

  const queryTerms = tokenize(query);
  const nearDuplicateCount = history.queryTermSets.filter(
    (previousTerms) => jaccardSimilarity(previousTerms, queryTerms) >= NEAR_DUPLICATE_JACCARD_THRESHOLD,
  ).length;

  if (nearDuplicateCount >= NEAR_DUPLICATE_ALERT_COUNT) {
    return { allowed: false, reason: "NEAR_DUPLICATE_PROBING" };
  }

  history.queryTermSets.push(queryTerms);
  sessionHistories.set(sessionId, history);
  return { allowed: true };
}
