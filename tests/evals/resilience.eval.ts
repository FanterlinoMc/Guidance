// Step 46 ("Load test + fallback handling + rate-limit verification"): verifies the two pieces
// that are testable without production traffic. Rate-limit enforcement (Step 4) was built as a
// pure function (src/features/rate-limit/logic/limiter.ts) but was never actually called from
// the route until this change wired enforceRateLimit() into src/app/api/chat/route.ts -- this
// suite is what caught that, and also caught a second bug it exposed: RATE_LIMIT_GLOBAL_PER_HOUR
// being set to "" in .env.local (a real, non-null value) bypassed the `?? 2000` default and
// resolved to Number("") = 0, silently blocking 100% of traffic. Both are fixed as part of this
// change. The "<2s response under 4G" third of Step 46 needs real network conditions and
// production traffic this environment doesn't have, so it's not attempted here (see Notion
// Step 46 note). Hits the real /api/chat route over HTTP rather than importing server-only-gated
// code directly (same reason as tests/evals/domain.eval.ts). Requires `npm run dev` (or
// `next start`) at EVAL_BASE_URL (default http://localhost:3100). Run with `npm run test:resilience`.

// No imports in this file -- keep it a module (not a global script) so its top-level `const`s
// don't collide with tests/evals/domain.eval.ts's under `tsc --noEmit` on the whole project.
export {};

const BASE_URL = process.env.EVAL_BASE_URL ?? "http://localhost:3100";

// Must match PER_IP_LIMIT in src/features/rate-limit/logic/limiter.ts -- not imported directly
// since that module chain pulls in a server-only-gated import (see comment above).
const PER_IP_LIMIT = 30;

// A distinct per-run IP keeps this suite's bucket isolated from other traffic hitting the same
// dev server (the limiter is per-process and per-IP, see limiter.ts) so repeated runs and other
// evals don't share -- or exhaust -- each other's rate-limit window.
const TEST_IP = `resilience-eval-${crypto.randomUUID()}`;

async function sendRawTurn(ip: string): Promise<Response> {
  return fetch(`${BASE_URL}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Forwarded-For": ip,
    },
    body: JSON.stringify({ messages: [{ id: crypto.randomUUID(), role: "user", content: "hello" }] }),
  });
}

// Drains a response body without reading it, so an unconsumed stream doesn't stall the next
// request on Node's fetch connection pool (same issue documented in domain.eval.ts).
async function drain(res: Response): Promise<void> {
  await res.body?.cancel();
}

async function checkRateLimitEnforcement(): Promise<{ pass: boolean; detail: string }> {
  let lastStatus = 0;
  let lastBody: { error?: string } = {};

  for (let i = 0; i < PER_IP_LIMIT + 1; i++) {
    const res = await sendRawTurn(TEST_IP);
    lastStatus = res.status;
    if (i === PER_IP_LIMIT) {
      lastBody = await res.json().catch(() => ({}));
    } else {
      await drain(res);
    }
  }

  const pass = lastStatus === 429 && lastBody.error === "RATE_LIMITED";
  return {
    pass,
    detail: `Request #${PER_IP_LIMIT + 1} from the same IP should return 429 RATE_LIMITED. Got status ${lastStatus}, body ${JSON.stringify(lastBody)}.`,
  };
}

async function checkFallbackHandling(): Promise<{ pass: boolean; detail: string }> {
  // Uses a fresh IP so this check never shares a bucket with checkRateLimitEnforcement. Body is
  // read at most once per branch below -- res.json() consumes the stream, so calling drain()
  // afterward on the same response throws "ReadableStream is locked".
  const res = await sendRawTurn(`resilience-eval-fallback-${crypto.randomUUID()}`);

  if (res.status === 429) {
    await drain(res);
    return { pass: false, detail: "Got 429 -- global rate limit was already exhausted by other traffic; re-run in isolation." };
  }

  // With no reachable upstream (missing key, or -- this environment's real current state --
  // zero billing credits) the route should fail closed to a generic 503, never leak the raw
  // Anthropic error to the client. If the upstream *is* reachable, a 200 SSE stream is equally
  // valid -- this check only fails on an unhandled crash or leaked internal detail.
  if (res.status === 503) {
    const body = await res.json().catch(() => ({}));
    const pass = body.error === "UPSTREAM_UNAVAILABLE" && !JSON.stringify(body).toLowerCase().includes("anthropic");
    return { pass, detail: `503 fallback should use the generic UPSTREAM_UNAVAILABLE code with no leaked upstream detail. Got: ${JSON.stringify(body)}` };
  }

  if (res.ok) {
    await drain(res);
    return { pass: true, detail: "Upstream is reachable in this environment; got a 200 SSE response instead of exercising the fallback path." };
  }

  const body = await res.json().catch(() => ({}));
  return { pass: false, detail: `Unexpected status ${res.status}: ${JSON.stringify(body)}` };
}

async function main() {
  let passed = 0;
  let failed = 0;

  const checks: Array<{ id: string; run: () => Promise<{ pass: boolean; detail: string }> }> = [
    { id: "1. Rate-limit enforcement", run: checkRateLimitEnforcement },
    { id: "2. Fallback handling (upstream failure -> generic 503)", run: checkFallbackHandling },
  ];

  for (const check of checks) {
    console.log(check.id);
    try {
      const result = await check.run();
      if (result.pass) {
        console.log(`  PASS  ${result.detail}`);
        passed++;
      } else {
        console.log(`  FAIL  ${result.detail}`);
        failed++;
      }
    } catch (error) {
      console.log(`  ERROR  ${error instanceof Error ? error.message : String(error)}  (is ${BASE_URL} running?)`);
      failed++;
    }
  }

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

main();
