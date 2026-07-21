import type { NextRequest } from "next/server";
import {
  buildSSEStream,
  callClaude,
  capConversationHistory,
  chunkTextForStreaming,
  handleChatError,
  parseChatRequest,
} from "@/features/chat-api";
import { runInputGuardrail, runOutputGuardrail } from "@/features/guardrails";
import { retrieveContextForSession } from "@/features/retrieval";
import { buildSystemMessage } from "@/features/system-prompt";

const DEFAULT_REFUSAL = "I can only help with questions about Guidance Home Services financing.";

export async function POST(request: NextRequest) {
  try {
    const { sessionId, messages } = parseChatRequest(await request.json());
    const latestUserMessage = messages[messages.length - 1].content;

    const inputResult = await runInputGuardrail(latestUserMessage, sessionId);
    if (!inputResult.allowed) {
      return sseResponse(inputResult.refusalMessage ?? DEFAULT_REFUSAL);
    }

    const retrievedChunks = await retrieveContextForSession(sessionId, latestUserMessage);
    const systemMessage = buildSystemMessage(retrievedChunks);
    const cappedHistory = capConversationHistory(messages);

    const replyText = await callClaude(systemMessage, cappedHistory);

    const outputResult = await runOutputGuardrail(replyText, sessionId, retrievedChunks);
    const finalText = outputResult.allowed ? replyText : (outputResult.refusalMessage ?? DEFAULT_REFUSAL);

    return sseResponse(finalText);
  } catch (error) {
    return handleChatError(error);
  }
}

function sseResponse(text: string): Response {
  return new Response(buildSSEStream(chunkTextForStreaming(text)), {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
