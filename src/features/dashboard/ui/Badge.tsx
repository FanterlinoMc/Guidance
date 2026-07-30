export type BadgeTone = "neutral" | "progress" | "success" | "danger" | "warning";

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: "bg-black/5 text-foreground/70",
  progress: "bg-brand/10 text-brand",
  success: "bg-emerald-100 text-emerald-800",
  danger: "bg-red-100 text-red-800",
  warning: "bg-amber-100 text-amber-800",
};

export function Badge({ tone, children }: { tone: BadgeTone; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${TONE_CLASSES[tone]}`}>
      {children}
    </span>
  );
}
