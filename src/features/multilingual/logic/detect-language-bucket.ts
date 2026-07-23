import { isRTL } from "./is-rtl";

export type LanguageBucket = "ar" | "ur" | "bn" | "other";

// Arabic-script letters Urdu uses but standard Arabic does not -- an objective Unicode-codepoint
// fact (same convention as is-rtl.ts's own blocks), not a translation judgment call. Persian and
// other Arabic-script languages would also match this and get bucketed as "ur", an accepted
// approximation since we only maintain AR/UR fallback chip sets, not a full language ID system.
const URDU_ONLY_LETTERS = new Set([0x0679, 0x0688, 0x0691, 0x06ba, 0x06d2, 0x06be, 0x06af]);

const BENGALI_BLOCK: [number, number] = [0x0980, 0x09ff];

function isUrdu(text: string): boolean {
  for (const char of text) {
    const codePoint = char.codePointAt(0);
    if (codePoint !== undefined && URDU_ONLY_LETTERS.has(codePoint)) return true;
  }
  return false;
}

function isBengali(text: string): boolean {
  for (const char of text) {
    const codePoint = char.codePointAt(0);
    if (codePoint !== undefined && codePoint >= BENGALI_BLOCK[0] && codePoint <= BENGALI_BLOCK[1]) return true;
  }
  return false;
}

// Buckets text into one of our 3 objectively-detectable non-English scripts, or "other" (which
// covers English, French, and Somali -- all Latin script, indistinguishable from each other
// without real language ID, which is out of scope here). Used only to pick which static
// fallback-chip set to show when the model hasn't supplied its own contextual suggestions (see
// ChatPanel's FALLBACK_QUICK_REPLIES_BY_LANGUAGE) -- never for anything guardrail- or
// compliance-related, where an unvetted script guess would be the wrong tool.
export function detectLanguageBucket(text: string): LanguageBucket {
  if (isBengali(text)) return "bn";
  if (isRTL(text)) return isUrdu(text) ? "ur" : "ar";
  return "other";
}
