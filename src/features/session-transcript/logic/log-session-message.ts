import { randomUUID } from "node:crypto";
import { redactPii } from "@/features/pii-redaction";
import type { ChatRole } from "@/features/chat-api";
import { appendTranscriptLine } from "../data/transcript-writer";
import type { SessionMessage } from "./types";

// Append-only JSONL stand-in for Step 7's real session_messages table -- same "swap the body,
// not the signature" pattern as lead-lifecycle's stage-event-writer and audit-log's
// jsonl-writer. PII is redacted before the line ever touches disk (Step 9.3's redactPii,
// reused rather than duplicated) so the durable transcript never carries raw
// emails/phones/SSNs/etc., regardless of what the visitor typed.
export async function logSessionMessage(sessionId: string, role: ChatRole, content: string): Promise<void> {
  const message: SessionMessage = {
    id: randomUUID(),
    sessionId,
    role,
    content: redactPii(content),
    createdAt: new Date().toISOString(),
  };

  await appendTranscriptLine(message);
}
