interface FunnelBarsProps {
  counts: { label: string; count: number }[];
}

export function FunnelBars({ counts }: FunnelBarsProps) {
  const max = Math.max(1, ...counts.map((c) => c.count));

  return (
    <div className="mt-3 space-y-2 rounded-lg border border-black/5 bg-white p-5 shadow-sm">
      {counts.map(({ label, count }) => (
        <div key={label} className="flex items-center gap-3">
          <span className="w-44 shrink-0 truncate text-xs capitalize text-foreground/70">{label}</span>
          <div className="h-2 flex-1 rounded-full bg-black/5">
            <div className="h-2 rounded-full bg-brand-gold" style={{ width: `${(count / max) * 100}%` }} />
          </div>
          <span className="w-8 shrink-0 text-right font-mono text-xs text-foreground/70">{count}</span>
        </div>
      ))}
    </div>
  );
}
