const ALLOWED_METHODS = "POST, OPTIONS";
const ALLOWED_HEADERS = "Content-Type";

// Default-deny by construction: an empty allowlist means requestOrigin never matches, so no
// Access-Control-Allow-Origin header is ever added and the browser's own same-origin policy
// blocks cross-origin JS reads. Set ALLOWED_ORIGINS once the real embedding domain(s) are known.
export function resolveCorsOrigin(requestOrigin: string | null, allowedOrigins: string[]): string | null {
  if (!requestOrigin) return null;
  return allowedOrigins.includes(requestOrigin) ? requestOrigin : null;
}

export function buildCorsHeaders(origin: string | null): Record<string, string> {
  if (!origin) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": ALLOWED_METHODS,
    "Access-Control-Allow-Headers": ALLOWED_HEADERS,
    // Required for the browser to send/accept the session cookie (src/core/session) on
    // cross-origin requests -- safe alongside a reflected (never wildcard) origin above.
    "Access-Control-Allow-Credentials": "true",
    Vary: "Origin",
  };
}
