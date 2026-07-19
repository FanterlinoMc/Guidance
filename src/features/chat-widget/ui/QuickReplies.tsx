const QUICK_REPLIES = [
  "How does Shariah-compliant financing work?",
  "What's the down payment?",
  "I'd like to talk to someone",
];

interface QuickRepliesProps {
  onSelect: (text: string) => void;
}

export function QuickReplies({ onSelect }: QuickRepliesProps) {
  return (
    <div className="flex flex-wrap gap-2 px-4 pb-3">
      {QUICK_REPLIES.map((reply) => (
        <button
          key={reply}
          type="button"
          onClick={() => onSelect(reply)}
          className="rounded-full border border-brand/30 px-3 py-1.5 text-sm text-brand hover:bg-brand/5"
        >
          {reply}
        </button>
      ))}
    </div>
  );
}
