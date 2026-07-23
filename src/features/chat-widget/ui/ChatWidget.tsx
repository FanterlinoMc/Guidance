"use client";

import { useState } from "react";
import { useChatSession } from "../logic/use-chat-session";
import { ChatBubble } from "./ChatBubble";
import { ChatPanel } from "./ChatPanel";

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, isStreaming, suggestions, sendMessage } = useChatSession();

  if (!isOpen) {
    return <ChatBubble onClick={() => setIsOpen(true)} />;
  }

  return (
    <ChatPanel
      messages={messages}
      isStreaming={isStreaming}
      suggestions={suggestions}
      onSend={sendMessage}
      onClose={() => setIsOpen(false)}
    />
  );
}
