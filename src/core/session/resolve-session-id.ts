import { randomUUID } from "node:crypto";
import type { NextRequest } from "next/server";

const SESSION_COOKIE_NAME = "gh_session_id";
const SESSION_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export interface ResolvedSession {
  sessionId: string;
  setCookieHeader: string | null;
}

// The server, not the client, is the source of truth for session identity: a client-supplied
// sessionId (the previous design) let any caller pick an arbitrary or copied ID on purpose.
// HttpOnly closes that for the legitimate browser widget -- page JS can no longer read or set
// the cookie, so it can't accidentally or maliciously override its own session, and a stolen
// XSS payload can't exfiltrate the raw ID either.
//
// KNOWN LIMITATION: this does NOT make the ID unforgeable in general. The cookie's value is
// trusted verbatim with no signature -- a non-browser caller (curl, a script, a proxy) can still
// set `Cookie: gh_session_id=<anything>` and have it accepted as-is. Closing that needs an
// HMAC-signed or server-validated ID, which needs a signing secret with nowhere to live yet
// (same "don't build against absent infra" reasoning as Steps 11/12/7 in
// EXTERNAL_ACCOUNTS_SETUP.md). Flagged for Step 45 (OWASP LLM Top 10 review) rather than
// papered over.
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
