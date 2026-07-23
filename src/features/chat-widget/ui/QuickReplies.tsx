import type { LanguageBucket } from "@/features/multilingual";

// Renders a row of tappable suggestion chips. Used two ways from ChatPanel: the model's per-turn
// contextual follow-ups (see useChatSession's `suggestions` and
// src/features/chat-api/logic/extract-suggestions.ts) when available, and this static fallback
// set otherwise (guardrail-blocked replies, the static PII/injection refusals, or a rare
// SUGGESTIONS parse failure never produce dynamic ones) -- so the visitor always has something
// tappable, never just a bare text box.
//
// The AR/UR/BN variants below are best-effort, not fluent-speaker vetted -- unlike the guardrail
// detection patterns and hard-prohibition content this project has repeatedly declined to
// fabricate (see Step 30's notes), these are low-stakes generic navigational button labels: an
// imprecise phrasing is a minor UX rough edge, not a compliance failure. FR/SO stay bucketed as
// "other" (English) since they're Latin-script and not reliably distinguishable from English by
// script alone -- see detect-language-bucket.ts.
export const FALLBACK_QUICK_REPLIES_BY_LANGUAGE: Record<LanguageBucket, string[]> = {
  other: [
    "How does Shariah-compliant financing work?",
    "What's the down payment?",
    "I'd like to talk to someone",
  ],
  ar: [
    "كيف يعمل التمويل المتوافق مع الشريعة؟",
    "كم نسبة الدفعة الأولى؟",
    "أرغب في التحدث مع أحد الموظفين",
  ],
  ur: [
    "شریعت کے مطابق فنانسنگ کیسے کام کرتی ہے؟",
    "پیشگی ادائیگی کتنی ہے؟",
    "میں کسی نمائندے سے بات کرنا چاہتا ہوں",
  ],
  bn: [
    "শরিয়াহ-সম্মত অর্থায়ন কীভাবে কাজ করে?",
    "ডাউন পেমেন্ট কত?",
    "আমি কারো সাথে কথা বলতে চাই",
  ],
};

interface QuickRepliesProps {
  replies: string[];
  onSelect: (text: string) => void;
}

export function QuickReplies({ replies, onSelect }: QuickRepliesProps) {
  return (
    <div className="flex flex-wrap gap-2 px-4 pb-3">
      {replies.map((reply) => (
        <button
          key={reply}
          type="button"
          onClick={() => onSelect(reply)}
          className="rounded-full border border-brand/25 px-3 py-1.5 text-sm text-brand transition-colors
            hover:border-brand-gold hover:bg-brand-gold/10"
        >
          {reply}
        </button>
      ))}
    </div>
  );
}
