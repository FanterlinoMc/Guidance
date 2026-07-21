import { AppError } from "@/core/errors/app-error";
import type { ChatTurn } from "./types";

export interface ChatRequest {
  messages: ChatTurn[];
}

// Validates the client's { messages } body against src/features/chat-widget's ChatMessage[]
// shape (id/role/content) -- id is dropped since ChatTurn only needs role/content for the model
// call. sessionId is deliberately NOT read from the body: it's server-resolved from an HttpOnly
// cookie (src/core/session/resolve-session-id.ts) so a client can't forge or copy another
// visitor's session identity.
export function parseChatRequest(body: unknown): ChatRequest {
  if (typeof body !== "object" || body === null) {
    throw new AppError("INVALID_REQUEST", "Request body must be a JSON object.", 400);
  }

  const { messages } = body as Record<string, unknown>;
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new AppError("INVALID_REQUEST", "messages must be a non-empty array.", 400);
  }

  const turns = messages.map(toChatTurn);
  if (turns[turns.length - 1].role !== "user") {
    throw new AppError("INVALID_REQUEST", "The last message must be from the user.", 400);
  }

  return { messages: turns };
}

function toChatTurn(entry: unknown): ChatTurn {
  if (typeof entry !== "object" || entry === null) {
    throw new AppError("INVALID_REQUEST", "Each message must be an object.", 400);
  }

  const { role, content } = entry as Record<string, unknown>;
  if (role !== "user" && role !== "assistant") {
    throw new AppError("INVALID_REQUEST", `Invalid message role: ${String(role)}.`, 400);
  }
  if (typeof content !== "string" || content.length === 0) {
    throw new AppError("INVALID_REQUEST", "Message content must be a non-empty string.", 400);
  }

  return { role, content };
}
