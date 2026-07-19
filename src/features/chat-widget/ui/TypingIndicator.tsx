export function TypingIndicator() {
  return (
    <div className="flex w-fit gap-1 rounded-2xl bg-gray-100 px-4 py-3" aria-label="Assistant is typing">
      <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />
    </div>
  );
}
