"use client";

import { useEffect, useRef } from "react";
import type { ChatMessage } from "../logic/types";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";

interface MessageListProps {
  messages: ChatMessage[];
  isStreaming: boolean;
}

export function MessageList({ messages, isStreaming }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  const lastMessage = messages[messages.length - 1];
  const showTyping = isStreaming && lastMessage?.role === "assistant" && lastMessage.content === "";

  return (
    <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 py-3">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      {showTyping && <TypingIndicator />}
      <div ref={bottomRef} />
    </div>
  );
}
