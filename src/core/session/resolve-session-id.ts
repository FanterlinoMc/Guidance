import { randomUUID } from "node:crypto";
import type { NextRequest } from "next/server";

const SESSION_COOKIE_NAME = "gh_session_id";
const SESSION_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export interface ResolvedSession {
  sessionId: string;
  setCookieHeader: string | null;
}

// The server, not the client, is the source of truth for session identity: a client-supplied
// sessionId (the previous design) could be forged or copied to append to another visitor's
// transcript/audit trail. An HttpOnly cookie means client-side JS never even sees the value,
// let alone gets to choose it -- the browser just echoes it back on every request.
export function resolveSessionId(request: NextRequest): ResolvedSession {
  const existing = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (existing) {
    return { sessionId: existing, setCookieHeader: null };
  }

  const sessionId = randomUUID();
  return { sessionId, setCookieHeader: buildSessionCookie(sessionId) };
}

function buildSessionCookie(sessionId: string): string {
  const isProduction = process.env.NODE_ENV === "production";
  // SameSite=None (needed for a widget embedded on a different domain, per ALLOWED_ORIGINS)
  // requires Secure, which requires HTTPS -- true in production, not on plain-HTTP localhost
  // dev. Same-origin requests work fine under Lax either way.
  const sameSitePolicy = isProduction ? "SameSite=None; Secure" : "SameSite=Lax";
  return `${SESSION_COOKIE_NAME}=${sessionId}; Path=/; HttpOnly; ${sameSitePolicy}; Max-Age=${SESSION_COOKIE_MAX_AGE_SECONDS}`;
}
