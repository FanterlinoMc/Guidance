import { logEvent } from "@/features/audit-log";
import { enforceKbQueryLimit } from "./enforce-kb-query-limit";
import { hashQuery } from "./hash-query";
import { retrieveContext, type RetrieveContextOptions } from "./retrieve-context";
import type { RetrievedChunk } from "./types";

export type SessionRetrieveContextOptions = Omit<RetrieveContextOptions, "allowedVisibility">;

// The audited, server-side entry point for retrieval (Step 13.1): enforces the anti-abuse
// query limit, then calls retrieveContext() at its default-deny visibility (public only) and
// logs every retrieval to the append-only audit log. Visibility isn't elevated here because no
// staff/dashboard session exists yet to justify it — the only real caller today is the public
// consumer widget. Revisit once Step 5's permission matrix and a real dashboard session land.
export async function retrieveContextForSession(
  sessionId: string,
  query: string,
  options: SessionRetrieveContextOptions = {},
): Promise<RetrievedChunk[]> {
  await enforceKbQueryLimit(sessionId, query);

  const chunks = retrieveContext(query, options);

  await logEvent(
    "RETRIEVAL_PERFORMED",
    { visibility: ["public"], chunkIds: chunks.map((chunk) => chunk.id), queryHash: hashQuery(query) },
    sessionId,
  );

  return chunks;
}
