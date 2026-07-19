import type { ChatMessage } from "../logic/types";
import { ChatInput } from "./ChatInput";
import { MessageList } from "./MessageList";
import { QuickReplies } from "./QuickReplies";

interface ChatPanelProps {
  messages: ChatMessage[];
  isStreaming: boolean;
  onSend: (text: string) => void;
  onClose: () => void;
}

export function ChatPanel({ messages, isStreaming, onSend, onClose }: ChatPanelProps) {
  const showGreeting = messages.length === 0;

  return (
    <div
      className="fixed bottom-0 right-0 z-50 flex h-full w-full flex-col bg-white shadow-2xl
        widget:bottom-6 widget:right-6 widget:h-[600px] widget:w-[380px] widget:rounded-xl"
    >
      <Header onClose={onClose} />
      {showGreeting && <Greeting />}
      <MessageList messages={messages} isStreaming={isStreaming} />
      {showGreeting && <QuickReplies onSelect={onSend} />}
      <ChatInput onSend={onSend} disabled={isStreaming} />
      <Footer />
    </div>
  );
}

function Header({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex items-center justify-between bg-brand px-4 py-3 text-white widget:rounded-t-xl">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 font-semibold">
          G
        </span>
        <div>
          <p className="text-sm font-semibold">Guidance Assistant</p>
          <p className="text-xs text-white/70">Typically replies instantly</p>
        </div>
      </div>
      <button type="button" onClick={onClose} aria-label="Close chat" className="text-xl leading-none">
        &times;
      </button>
    </div>
  );
}

function Greeting() {
  return (
    <p className="px-4 pt-3 text-sm text-gray-700">
      Hi! I can help explain Guidance&apos;s Shariah-compliant home financing, or connect you with an
      Account Executive.
    </p>
  );
}

function Footer() {
  return (
    <p className="border-t px-4 py-2 text-center text-[11px] text-gray-400">
      Equal Housing Lender &middot; NMLS #2908
    </p>
  );
}
