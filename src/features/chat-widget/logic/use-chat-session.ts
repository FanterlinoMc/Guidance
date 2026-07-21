"use client";

import { useCallback, useEffect, useState } from "react";
import { loadSession, saveSession } from "./session-storage";
import { parseSSELine, splitSSEBuffer } from "./sse";
import type { ChatMessage } from "./types";

const FALLBACK_ERROR_TEXT =
  "Sorry, I couldn't reach the assistant just now. Please try again in a moment.";

function appendDelta(messages: ChatMessage[], id: string, delta: string): ChatMessage[] {
  return messages.map((m) => (m.id === id ? { ...m, content: m.content + delta } : m));
}

function setContent(messages: ChatMessage[], id: string, content: string): ChatMessage[] {
  return messages.map((m) => (m.id === id ? { ...m, content } : m));
}

async function streamAssistantReply(
  history: ChatMessage[],
  onDelta: (delta: string) => void,
): Promise<void> {
  const res = await fetch("/api/chat", {
    method: "POST",
    // Sends the server-issued session cookie (src/core/session) even when the widget is
    // embedded cross-origin -- harmless no-op for same-origin requests.
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: history }),
  });

  if (!res.ok || !res.body) {
    throw new Error(`Chat request failed: ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const { events, remainder } = splitSSEBuffer(buffer);
    buffer = remainder;
    for (const line of events) {
      const delta = parseSSELine(line);
      if (delta) onDelta(delta);
    }
  }
}

export function useChatSession() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadSession()?.messages ?? []);
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    saveSession({ messages });
  }, [messages]);

  const sendMessage = useCallback(
    async (text: string) => {
      const userMessage: ChatMessage = { id: crypto.randomUUID(), role: "user", content: text };
      const assistantId = crypto.randomUUID();
      const history = [...messages, userMessage];

      setMessages([...history, { id: assistantId, role: "assistant", content: "" }]);
      setIsStreaming(true);

      try {
        await streamAssistantReply(history, (delta) =>
          setMessages((prev) => appendDelta(prev, assistantId, delta)),
        );
      } catch {
        setMessages((prev) => setContent(prev, assistantId, FALLBACK_ERROR_TEXT));
      } finally {
        setIsStreaming(false);
      }
    },
    [messages],
  );

  return { messages, isStreaming, sendMessage };
}
