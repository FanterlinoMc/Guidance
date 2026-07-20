import { encode } from "gpt-tokenizer";
import type { ChatTurn } from "./types";

// NOTE: 4000 tokens is a starting judgment call, not a hard model limit — Claude's actual
// context window is far larger. The goal is bounding cost/latency and keeping the model
// focused on the recent conversation, not avoiding an overflow error. Revisit once real
// conversation lengths are observed.
export const MAX_HISTORY_TOKENS = 4000;

// Keeps the most recent turns that fit within maxTokens, dropping the oldest first. Always
// keeps at least the single most recent turn, even if it alone exceeds the budget — an empty
// history is worse than one oversized turn.
export function capConversationHistory(turns: ChatTurn[], maxTokens = MAX_HISTORY_TOKENS): ChatTurn[] {
  const capped: ChatTurn[] = [];
  let totalTokens = 0;

  for (let i = turns.length - 1; i >= 0; i--) {
    const turnTokens = encode(turns[i].content).length;
    if (capped.length > 0 && totalTokens + turnTokens > maxTokens) break;
    capped.unshift(turns[i]);
    totalTokens += turnTokens;
  }

  return capped;
}
