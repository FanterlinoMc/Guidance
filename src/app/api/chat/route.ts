import type { NextRequest } from "next/server";
import {
  buildSSEStream,
  callClaude,
  capConversationHistory,
  chunkTextForStreaming,
  extractSuggestions,
  handleChatError,
  parseChatRequest,
} from "@/features/chat-api";
import { getAllowedOrigins } from "@/core/env/server-env";
import { resolveSessionId } from "@/core/session/resolve-session-id";
import { buildCorsHeaders, resolveCorsOrigin } from "@/core/security/cors";
import { runInputGuardrail, runOutputGuardrail } from "@/features/guardrails";
import { enforceRateLimit } from "@/features/rate-limit";
import { retrieveContextForSession } from "@/features/retrieval";
import { logSessionMessage } from "@/features/session-transcript";
import { buildSystemMessage } from "@/features/system-prompt";

const DEFAULT_REFUSAL = "I can only help with questions about Guidance Home Services financing.";

export async function OPTIONS(request: NextRequest) {
  return new Response(null, { status: 204, headers: corsHeadersFor(request) });
}

export async function POST(request: NextRequest) {
  const corsHeaders = corsHeadersFor(request);
  const { sessionId, setCookieHeader } = resolveSessionId(request);

  try {
    enforceRateLimit(request);

    const { messages } = parseChatRequest(await request.json());
    const latestUserMessage = messages[messages.length - 1].content;
    await logSessionMessage(sessionId, "user", latestUserMessage);

    const inputResult = await runInputGuardrail(latestUserMessage, sessionId);
    if (!inputResult.allowed) {
      return sseResponse(sessionId, inputResult.refusalMessage ?? DEFAULT_REFUSAL, [], corsHeaders, setCookieHeader);
    }

    const retrievedChunks = await retrieveContextForSession(sessionId, latestUserMessage);
    const systemMessage = buildSystemMessage(retrievedChunks);
    const cappedHistory = capConversationHistory(messages);

    const replyText = await callClaude(systemMessage, cappedHistory);
    const { text: cleanedReply, suggestions } = extractSuggestions(replyText);

    const outputResult = await runOutputGuardrail(cleanedReply, sessionId, retrievedChunks);
    const finalText = outputResult.allowed ? cleanedReply : (outputResult.refusalMessage ?? DEFAULT_REFUSAL);
    // No follow-up chips on a guardrail-blocked reply -- the model's suggestions were written
    // for the reply it intended to give, not the refusal that replaced it.
    const finalSuggestions = outputResult.allowed ? suggestions : [];

    return sseResponse(sessionId, finalText, finalSuggestions, corsHeaders, setCookieHeader);
  } catch (error) {
    const errorResponse = handleChatError(error);
    for (const [name, value] of Object.entries(corsHeaders)) {
      errorResponse.headers.set(name, value);
    }
    if (setCookieHeader) errorResponse.headers.set("Set-Cookie", setCookieHeader);
    return errorResponse;
  }
}

function corsHeadersFor(request: NextRequest): Record<string, string> {
  return buildCorsHeaders(resolveCorsOrigin(request.headers.get("origin"), getAllowedOrigins()));
}

async function sseResponse(
  sessionId: string,
  text: string,
  suggestions: string[],
  corsHeaders: Record<string, string>,
  setCookieHeader: string | null,
): Promise<Response> {
  await logSessionMessage(sessionId, "assistant", text);

  const response = new Response(buildSSEStream(chunkTextForStreaming(text), suggestions), {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      ...corsHeaders,
    },
  });
  if (setCookieHeader) response.headers.set("Set-Cookie", setCookieHeader);
  return response;
}
