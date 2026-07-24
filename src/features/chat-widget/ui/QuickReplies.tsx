"use client";

import { useEffect, useRef, useState } from "react";
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    function measure() {
      const { scrollWidth, clientWidth, scrollLeft } = el as HTMLDivElement;
      // A few px of slack so rounding doesn't leave an arrow stuck on at the very end.
      setCanScrollLeft(scrollLeft > 4);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
    }

    measure();
    el.addEventListener("scroll", measure, { passive: true });
    // ResizeObserver catches the panel resizing (e.g. a narrower viewport), not just content
    // changes, so the arrows stay correct if that changes how much overflows.
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => {
      el.removeEventListener("scroll", measure);
      observer.disconnect();
    };
  }, [replies]);

  function scrollByPage(direction: -1 | 1) {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: "smooth" });
  }

  return (
    // A single scrollable row instead of wrapping -- keeps the chip strip to one line no matter
    // how many/long the suggestions are, so it can't push the message area (the thing the
    // visitor actually came to read) further down the panel. Arrow buttons (rather than a
    // scrollbar/handle) are the simplest, most obvious affordance for "there's more, tap to see
    // it" -- they only appear on the side there's actually more content, and sit outside the
    // scroll area so they never cover a chip.
    <div className="flex items-center gap-1 px-4 pb-3">
      {canScrollLeft && (
        <ScrollArrowButton direction="left" onClick={() => scrollByPage(-1)} />
      )}
      <div
        ref={scrollRef}
        className="flex flex-1 gap-2 overflow-x-auto [-webkit-overflow-scrolling:touch]
          [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {replies.map((reply) => (
          <button
            key={reply}
            type="button"
            onClick={() => onSelect(reply)}
            className="shrink-0 whitespace-nowrap rounded-full border border-brand/25 px-3 py-1.5 text-sm text-brand
              transition-colors hover:border-brand-gold hover:bg-brand-gold/10"
          >
            {reply}
          </button>
        ))}
      </div>
      {canScrollRight && (
        <ScrollArrowButton direction="right" onClick={() => scrollByPage(1)} />
      )}
    </div>
  );
}

function ScrollArrowButton({ direction, onClick }: { direction: "left" | "right"; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === "left" ? "Show previous suggestions" : "Show more suggestions"}
      className="flex shrink-0 items-center justify-center rounded-full border border-brand/25 p-1.5 text-brand
        transition-colors hover:border-brand-gold hover:bg-brand-gold/10"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {direction === "left" ? <path d="M15 6l-6 6 6 6" /> : <path d="M9 6l6 6-6 6" />}
      </svg>
    </button>
  );
}
