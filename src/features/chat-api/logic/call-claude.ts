import Anthropic from "@anthropic-ai/sdk";
import { getAnthropicApiKey } from "@/core/env/server-env";
import { CLAUDE_MODEL } from "./claude-model";
import type { ChatTurn } from "./types";

const MAX_REPLY_TOKENS = 4096;

// Consumes the full Anthropic stream server-side and returns the complete reply text, rather
// than forwarding raw deltas to the client. This lets runOutputGuardrail() (Step 16.1) check
// the whole reply -- including a leaked excerpt that spans a chunk boundary -- before any of
// it reaches the visitor. build-sse-stream.ts re-chunks the checked text for the client's
// existing per-delta rendering. Real incremental token streaming with a safe per-chunk
// moderation strategy is deferred until there's live traffic to design it against.
export async function callClaude(systemMessage: string, history: ChatTurn[]): Promise<string> {
  const client = new Anthropic({ apiKey: getAnthropicApiKey() });

  const stream = client.messages.stream({
    model: CLAUDE_MODEL,
    max_tokens: MAX_REPLY_TOKENS,
    system: systemMessage,
    thinking: { type: "adaptive" },
    messages: history.map(({ role, content }) => ({ role, content })),
  });

  const finalMessage = await stream.finalMessage();
  return finalMessage.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("");
}
