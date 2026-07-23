interface ChatBubbleProps {
  onClick: () => void;
}

export function ChatBubble({ onClick }: ChatBubbleProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Chat with the Guidance Assistant"
      className="chat-bubble-greet fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-full
        bg-brand py-3 pl-3.5 pr-5 text-white shadow-[0_8px_24px_rgb(11_37_69_/_0.35)]
        transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2
        focus-visible:outline-offset-2 focus-visible:outline-brand-gold"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-gold/20">
        <ChatIcon />
      </span>
      <span className="text-sm font-semibold">Chat with us</span>
    </button>
  );
}

function ChatIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}
