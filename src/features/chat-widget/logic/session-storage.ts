import type { ChatMessage } from "./types";

const STORAGE_KEY = "guidance-chat-session";

interface StoredSession {
  sessionId: string;
  messages: ChatMessage[];
}

export function loadSession(): StoredSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredSession) : null;
  } catch {
    return null;
  }
}

export function saveSession(session: StoredSession): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // storage unavailable (private-browsing quota, etc.) — chat still works in-memory
  }
}
