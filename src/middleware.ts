import { NextResponse, type NextRequest } from "next/server";
import { buildContentSecurityPolicy } from "@/core/security/build-content-security-policy";
import { STATIC_SECURITY_HEADERS } from "@/core/security/static-security-headers";

// NOTE: strict CORS on /api/chat (origin-locked to Guidance domains) is deliberately not
// built here — that route doesn't exist yet (Step 17, blocked on ANTHROPIC_API_KEY). Add it
// alongside the route so there's an actual origin allowlist to enforce, not a guess.
export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const contentSecurityPolicy = buildContentSecurityPolicy(nonce);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", contentSecurityPolicy);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", contentSecurityPolicy);
  for (const [name, value] of Object.entries(STATIC_SECURITY_HEADERS)) {
    response.headers.set(name, value);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
