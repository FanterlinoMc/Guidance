// Wire format is intentionally simple, not strict SSE: each line is `data: {"text": "..."}\n`,
// optionally followed by one `data: {"suggestions": [...]}\n` line, terminated by
// `data: [DONE]\n`. Matches chat-widget/logic/sse.ts's parseSSELine(), which was already built
// and committed against the text-chunk shape (Step 22 prep work) ahead of this route.
export function buildSSEStream(chunks: string[], suggestions: string[] = []): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n`));
      }
      if (suggestions.length > 0) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ suggestions })}\n`));
      }
      controller.enqueue(encoder.encode("data: [DONE]\n"));
      controller.close();
    },
  });
}
