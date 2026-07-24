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
  const latestMessageRef = useRef<HTMLDivElement>(null);
  // Guards against re-anchoring on every streamed delta -- appendDelta() keeps the same message
  // id and only grows .content, so this only flips once per assistant turn (its first non-empty
  // delta), not on every chunk after that.
  const anchoredMessageId = useRef<string | null>(null);

  useEffect(() => {
    const latest = messages[messages.length - 1];
    if (!latest) return;

    if (latest.role === "user") {
      // The visitor's own message (and the typing indicator that follows) should be visible.
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    if (latest.content !== "" && anchoredMessageId.current !== latest.id) {
      anchoredMessageId.current = latest.id;
      // Anchor to the START of the reply, not the list's bottom -- bottom-anchoring kept
      // re-snapping down as a long reply streamed in, so once it finished only the tail end was
      // ever visible and the visitor had to scroll back up to read the beginning.
      latestMessageRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [messages]);

  const lastMessage = messages[messages.length - 1];
  const showTyping = isStreaming && lastMessage?.role === "assistant" && lastMessage.content === "";

  return (
    <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 py-3">
      {messages.map((message, index) => {
        const isLast = index === messages.length - 1;
        // Skip the empty assistant placeholder bubble while its first delta hasn't arrived yet --
        // the TypingIndicator below already represents "assistant is replying", so rendering both
        // is just a blank white bubble taking up space above the dots for no reason.
        if (isLast && message.role === "assistant" && message.content === "") {
          return null;
        }
        return (
          <div key={message.id} ref={isLast ? latestMessageRef : undefined}>
            <MessageBubble message={message} />
          </div>
        );
      })}
      {showTyping && <TypingIndicator />}
      <div ref={bottomRef} />
    </div>
  );
}
