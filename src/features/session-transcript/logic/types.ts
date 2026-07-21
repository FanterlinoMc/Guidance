import type { ChatRole } from "@/features/chat-api";

// Field names mirror supabase/migrations/0001_initial_schema.sql's session_messages table
// so pointing this at a real Postgres/Supabase instance later is a store swap, not a
// redesign (same pattern as lead-lifecycle/agent-records).
export interface SessionMessage {
  id: string;
  sessionId: string;
  role: ChatRole;
  content: string;
  createdAt: string;
}
