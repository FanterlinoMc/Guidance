export function EmptyState({ message }: { message: string }) {
  return (
    <div className="mt-3 rounded-lg border border-dashed border-black/10 bg-white/50 px-5 py-8 text-center text-sm text-foreground/50">
      {message}
    </div>
  );
}
