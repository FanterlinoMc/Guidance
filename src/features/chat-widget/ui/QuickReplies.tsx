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
  // Percent-based scroll-handle geometry, recomputed on scroll/resize/content change. null means
  // the row fits without scrolling, so the handle stays hidden entirely.
  const [handle, setHandle] = useState<{ widthPct: number; leftPct: number } | null>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    function measure() {
      const { scrollWidth, clientWidth, scrollLeft } = el as HTMLDivElement;
      if (scrollWidth <= clientWidth) {
        setHandle(null);
        return;
      }
      setHandle({
        widthPct: (clientWidth / scrollWidth) * 100,
        leftPct: (scrollLeft / scrollWidth) * 100,
      });
    }

    measure();
    el.addEventListener("scroll", measure, { passive: true });
    // Native scrollbar styling is unreliable across browsers -- mobile Safari in particular
    // ignores it and only shows its own transient scrollbar during an active drag -- so this
    // renders its own always-visible track/thumb below the row instead. ResizeObserver catches
    // the panel resizing (e.g. a narrower viewport), not just content changes.
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => {
      el.removeEventListener("scroll", measure);
      observer.disconnect();
    };
  }, [replies]);

  return (
    <div>
      {/* A single scrollable row instead of wrapping -- keeps the chip strip to one line no
          matter how many/long the suggestions are, so it can't push the message area (the thing
          the visitor actually came to read) further down the panel. */}
      <div
        ref={scrollRef}
        className={`flex gap-2 overflow-x-auto px-4 [-webkit-overflow-scrolling:touch]
          [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${handle ? "pb-1.5" : "pb-3"}`}
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
      {handle && (
        <div className="px-4 pb-2.5">
          <div className="relative h-1 rounded-full bg-brand/10">
            <div
              className="absolute h-full rounded-full bg-brand-gold/70"
              style={{ width: `${handle.widthPct}%`, left: `${handle.leftPct}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
