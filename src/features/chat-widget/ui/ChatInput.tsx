"use client";

import { useState, type FormEvent } from "react";

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t px-3 py-2">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Type your question..."
        disabled={disabled}
        className="flex-1 rounded-full border px-4 py-2 text-sm outline-none focus:border-brand"
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className="rounded-full bg-brand px-4 py-2 text-sm text-white disabled:opacity-40"
      >
        Send
      </button>
    </form>
  );
}
