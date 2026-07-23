// The system prompt's "# Suggested follow-ups" section asks the model to end its reply with a
// `SUGGESTIONS: [...]` line. This strips that line from the visible reply and parses it into a
// plain string array, BEFORE the output guardrail sees the text -- so a malformed or malicious
// suggestions line never reaches the visitor as literal text, and the guardrail's regex checks
// only ever run against the real reply.
const SUGGESTIONS_LINE = /\n{0,2}SUGGESTIONS:\s*(\[[\s\S]*?\])\s*$/i;

const MAX_SUGGESTIONS = 3;

export interface ExtractedReply {
  text: string;
  suggestions: string[];
}

export function extractSuggestions(replyText: string): ExtractedReply {
  const match = replyText.match(SUGGESTIONS_LINE);
  if (!match) return { text: replyText, suggestions: [] };

  const text = replyText.slice(0, match.index).trimEnd();

  try {
    const parsed: unknown = JSON.parse(match[1]);
    if (!Array.isArray(parsed)) return { text, suggestions: [] };
    const suggestions = parsed.filter((item): item is string => typeof item === "string").slice(0, MAX_SUGGESTIONS);
    return { text, suggestions };
  } catch {
    // Malformed JSON from the model -- fail closed to no suggestions rather than crash the reply.
    return { text, suggestions: [] };
  }
}
