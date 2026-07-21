import { AppError } from "@/core/errors/app-error";

// AppError (bad request, retrieval abuse, ...) maps to its own status with a safe message.
// Anything else -- including getAnthropicApiKey() throwing because ANTHROPIC_API_KEY isn't
// set -- is logged server-side and returned as a generic 503 so internal detail never reaches
// the client; the widget's existing catch block already shows its own fallback text on any
// non-ok response.
export function handleChatError(error: unknown): Response {
  if (error instanceof AppError) {
    return Response.json({ error: error.code, message: error.message }, { status: error.status });
  }

  console.error("[api/chat]", error);
  return Response.json(
    { error: "UPSTREAM_UNAVAILABLE", message: "The assistant is temporarily unavailable." },
    { status: 503 },
  );
}
