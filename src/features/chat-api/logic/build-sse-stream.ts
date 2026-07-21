// Wire format is intentionally simple, not strict SSE: each line is `data: {"text": "..."}\n`,
// terminated by `data: [DONE]\n`. Matches chat-widget/logic/sse.ts's parseSSELine(), which was
// already built and committed against this exact shape (Step 22 prep work) ahead of this route.
export function buildSSEStream(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n`));
      }
      controller.enqueue(encoder.encode("data: [DONE]\n"));
      controller.close();
    },
  });
}
