import { detectLanguageBucket } from "@/features/multilingual";
import type { ChatMessage } from "../logic/types";
import { ChatInput } from "./ChatInput";
import { MessageList } from "./MessageList";
import { FALLBACK_QUICK_REPLIES_BY_LANGUAGE, QuickReplies } from "./QuickReplies";

interface ChatPanelProps {
  messages: ChatMessage[];
  isStreaming: boolean;
  suggestions: string[];
  onSend: (text: string) => void;
  onClose: () => void;
}

export function ChatPanel({ messages, isStreaming, suggestions, onSend, onClose }: ChatPanelProps) {
  const showGreeting = messages.length === 0;
  const lastMessage = messages[messages.length - 1];
  const hasCompletedReply = !isStreaming && lastMessage?.role === "assistant" && lastMessage.content !== "";

  // Never leave the visitor with only the text box: the model's own follow-ups (suggestions)
  // cover the common case, but they come back empty whenever there's no model turn to draw
  // from -- a guardrail-blocked reply (see route.ts's finalSuggestions), a static PII/injection
  // refusal that never reached the model, a network-error fallback, or the model simply omitting
  // a parseable SUGGESTIONS line. Falling back to a static chip set in every one of those cases
  // means there's always something tappable once a turn finishes -- and picking that set by the
  // visitor's own last message (not always English) keeps the fallback from reading as a jarring
  // language switch mid-conversation.
  const showQuickReplies = showGreeting || hasCompletedReply;
  const lastUserMessage = [...messages].reverse().find((message) => message.role === "user");
  const fallbackLanguage = showGreeting ? "other" : detectLanguageBucket(lastUserMessage?.content ?? "");
  const repliesToShow = suggestions.length > 0 ? suggestions : FALLBACK_QUICK_REPLIES_BY_LANGUAGE[fallbackLanguage];

  return (
    <div
      className="fixed bottom-0 right-0 z-50 flex h-full w-full flex-col overflow-hidden border-t-2
        border-brand-gold bg-brand-paper shadow-2xl
        widget:bottom-6 widget:right-6 widget:h-[min(600px,85vh)] widget:w-[380px] widget:rounded-xl widget:border-t-2"
    >
      <Header onClose={onClose} />
      {showGreeting && <Greeting />}
      <MessageList messages={messages} isStreaming={isStreaming} />
      {showQuickReplies && <QuickReplies replies={repliesToShow} onSelect={onSend} />}
      <ChatInput onSend={onSend} disabled={isStreaming} />
      <Footer />
    </div>
  );
}

// A faint eight-point star lattice -- a restrained nod to Islamic geometric ornament, kept
// abstract and low-opacity so it reads as considered brand texture, not decoration competing
// with the header text.
function HeaderPattern() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.08]"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern id="header-lattice" width="28" height="28" patternUnits="userSpaceOnUse">
          <path
            d="M14 2 L18 10 L26 14 L18 18 L14 26 L10 18 L2 14 L10 10 Z"
            fill="none"
            stroke="white"
            strokeWidth="1"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#header-lattice)" />
    </svg>
  );
}

function Header({ onClose }: { onClose: () => void }) {
  return (
    <div className="relative flex items-center justify-between overflow-hidden bg-brand px-4 py-3 text-white widget:rounded-t-[10px]">
      <HeaderPattern />
      <div className="relative flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-gold/50 bg-white/10 text-sm font-semibold tracking-wide">
          G
        </span>
        <div>
          <p className="text-sm font-semibold">Guidance Assistant</p>
          <p className="text-xs text-white/70">Typically replies instantly</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close chat"
        className="relative rounded-full p-1 text-xl leading-none text-white/80 transition-colors hover:bg-white/10 hover:text-white"
      >
        &times;
      </button>
    </div>
  );
}

function Greeting() {
  return (
    <p className="px-4 pt-3 text-sm leading-relaxed text-gray-700">
      Hi! I can help explain Guidance&apos;s Shariah-compliant home financing, or connect you with an
      Account Executive.
    </p>
  );
}

function Footer() {
  return (
    <p className="border-t border-brand/10 bg-brand-paper px-4 py-2 text-center text-[11px] tracking-wide text-gray-400">
      Equal Housing Lender &middot; NMLS #2908
    </p>
  );
}
