import type { NextRequest } from "next/server";
import {
  buildSSEStream,
  callClaude,
  capConversationHistory,
  chunkTextForStreaming,
  handleChatError,
  parseChatRequest,
} from "@/features/chat-api";
import { getAllowedOrigins } from "@/core/env/server-env";
import { buildCorsHeaders, resolveCorsOrigin } from "@/core/security/cors";
import { runInputGuardrail, runOutputGuardrail } from "@/features/guardrails";
import { retrieveContextForSession } from "@/features/retrieval";
import { logSessionMessage } from "@/features/session-transcript";
import { buildSystemMessage } from "@/features/system-prompt";

const DEFAULT_REFUSAL = "I can only help with questions about Guidance Home Services financing.";

export async function OPTIONS(request: NextRequest) {
  return new Response(null, { status: 204, headers: corsHeadersFor(request) });
}

export async function POST(request: NextRequest) {
  const corsHeaders = corsHeadersFor(request);

  try {
    const { sessionId, messages } = parseChatRequest(await request.json());
    const latestUserMessage = messages[messages.length - 1].content;
    await logSessionMessage(sessionId, "user", latestUserMessage);

    const inputResult = await runInputGuardrail(latestUserMessage, sessionId);
    if (!inputResult.allowed) {
      return sseResponse(sessionId, inputResult.refusalMessage ?? DEFAULT_REFUSAL, corsHeaders);
    }

    const retrievedChunks = await retrieveContextForSession(sessionId, latestUserMessage);
    const systemMessage = buildSystemMessage(retrievedChunks);
    const cappedHistory = capConversationHistory(messages);

    const replyText = await callClaude(systemMessage, cappedHistory);

    const outputResult = await runOutputGuardrail(replyText, sessionId, retrievedChunks);
    const finalText = outputResult.allowed ? replyText : (outputResult.refusalMessage ?? DEFAULT_REFUSAL);

    return sseResponse(sessionId, finalText, corsHeaders);
  } catch (error) {
    const errorResponse = handleChatError(error);
    for (const [name, value] of Object.entries(corsHeaders)) {
      errorResponse.headers.set(name, value);
    }
    return errorResponse;
  }
}

function corsHeadersFor(request: NextRequest): Record<string, string> {
  return buildCorsHeaders(resolveCorsOrigin(request.headers.get("origin"), getAllowedOrigins()));
}

async function sseResponse(sessionId: string, text: string, corsHeaders: Record<string, string>): Promise<Response> {
  await logSessionMessage(sessionId, "assistant", text);

  return new Response(buildSSEStream(chunkTextForStreaming(text)), {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      ...corsHeaders,
    },
  });
}
