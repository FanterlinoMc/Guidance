// Splits a complete, already guardrail-checked reply into word-sized deltas so the client's
// existing per-delta rendering (built for real token streaming, see chat-widget/logic/sse.ts)
// has something to animate. See call-claude.ts for why the full reply is generated and
// safety-checked server-side before any of it is chunked out to the client.
export function chunkTextForStreaming(text: string): string[] {
  return text.split(" ").map((word, index) => (index === 0 ? word : ` ${word}`));
}
