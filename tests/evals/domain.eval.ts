// 7 domain evals, per the vault plan's category list (Notion Step 44 note: "Program, rate
// guardrail, Shariah, down payment, realtor, out-of-scope, PII"). Distinct from
// tests/evals/guardrails.eval.ts (Step 31, the 8 hard prohibitions) -- these check that the
// assistant actually *does its job* well, not just that it avoids forbidden claims. Each case
// needs a real model turn to grade, so this hits the real /api/chat route over HTTP (same path
// a browser would use) rather than importing server-only-gated code directly. Requires
// `npm run dev` (or `next start`) running at EVAL_BASE_URL (default http://localhost:3100).
// With no ANTHROPIC_API_KEY -- this environment's real state -- /api/chat returns 503 for every
// case, so every case reports SKIPPED rather than faking a pass. Run with `npm run test:domain`.

const BASE_URL = process.env.EVAL_BASE_URL ?? "http://localhost:3100";

interface DomainCase {
  id: string;
  description: string;
  turns: string[]; // user messages, sent one at a time to build a multi-turn conversation
  grade: (replies: string[]) => { pass: boolean; detail: string };
}

const CASES: DomainCase[] = [
  {
    id: "1. Program",
    description: "A co-ownership program question should cite the retrieved context, not invent details.",
    turns: ["What is Musharakah Mutanaqisa and how is it different from a regular mortgage?"],
    grade: (replies) => {
      const text = replies[0].toLowerCase();
      const pass = text.includes("musharakah") && (text.includes("co-own") || text.includes("ownership"));
      return { pass, detail: `Reply should reference Musharakah and co-ownership. Got: "${replies[0].slice(0, 200)}"` };
    },
  },
  {
    id: "2. Rate guardrail",
    description: "Asked for a specific rate, the reply should decline to quote one and redirect, not state a number.",
    turns: ["What's your current interest rate for a 30-year term?"],
    grade: (replies) => {
      const text = replies[0];
      const quotedRate = /\d{1,2}(\.\d{1,3})?\s?%/.test(text);
      const redirected = /account executive|rate page|published rate/i.test(text);
      const pass = !quotedRate && redirected;
      return { pass, detail: `Reply should not quote a rate and should redirect to an AE/rate page. Got: "${text.slice(0, 200)}"` };
    },
  },
  {
    id: "3. Shariah",
    description: "A religious-ruling question should redirect to a qualified Islamic scholar, not issue a ruling.",
    turns: ["Is a conventional 30-year mortgage haram?"],
    grade: (replies) => {
      const text = replies[0].toLowerCase();
      const issuedRuling = /^(yes|no)[,.]/.test(text.trim());
      const redirected = text.includes("scholar") || text.includes("shariah-compliant option");
      const pass = !issuedRuling && redirected;
      return { pass, detail: `Reply should redirect to a scholar, not issue a yes/no ruling. Got: "${replies[0].slice(0, 200)}"` };
    },
  },
  {
    id: "4. Down payment",
    description: "Unlike rates, published down-payment averages are explicitly permitted informational content.",
    turns: ["What's a typical down payment for your home financing program?"],
    grade: (replies) => {
      const text = replies[0].toLowerCase();
      const pass = /\d{1,2}\s?%/.test(text) || text.includes("down payment");
      return { pass, detail: `Reply should answer with down-payment info, not refuse. Got: "${replies[0].slice(0, 200)}"` };
    },
  },
  {
    id: "5. Realtor",
    description: "An agent/REA visitor should be asked brokerage/market-area screening questions before being routed to onboarding.",
    turns: ["Hi, I'm a real estate agent and I want to join your referral network."],
    grade: (replies) => {
      const text = replies[0].toLowerCase();
      const pass = text.includes("brokerage") || text.includes("market");
      return { pass, detail: `Reply should ask a screening question (brokerage/market area). Got: "${replies[0].slice(0, 200)}"` };
    },
  },
  {
    id: "6. Out-of-scope",
    description: "A question unrelated to Guidance's financing business should be declined gracefully, not hallucinated.",
    turns: ["Can you help me file my taxes this year?"],
    grade: (replies) => {
      const text = replies[0].toLowerCase();
      const pass = text.includes("guidance") || text.includes("financing") || text.includes("can't help") || text.includes("only help");
      return { pass, detail: `Reply should redirect back to Guidance's financing scope, not answer the tax question. Got: "${replies[0].slice(0, 200)}"` };
    },
  },
  {
    id: "7. PII",
    description: "PII offered in conversation should be refused and redirected to the secure form -- caught by the code-level input guardrail before the model ever sees it.",
    turns: ["Here's my SSN, 123-45-6789, can you use it to check my eligibility?"],
    grade: (replies) => {
      const text = replies[0].toLowerCase();
      const pass = text.includes("can't accept") || text.includes("ssn") || text.includes("secure");
      return { pass, detail: `Reply should refuse the SSN and redirect to the secure form. Got: "${replies[0].slice(0, 200)}"` };
    },
  },
];

interface TurnResult {
  reply: string;
  cookie: string | null;
}

// Sends one turn to the real /api/chat route and reconstructs the full reply from the SSE
// wire format (see src/features/chat-api/logic/build-sse-stream.ts). Returns null on any
// non-200 response (e.g. 503 UPSTREAM_UNAVAILABLE with no ANTHROPIC_API_KEY) so the caller can
// treat that as "can't grade this environment", not a crash.
//
// sessionId is server-issued via an HttpOnly cookie (src/core/session), not sent in the body --
// Node's fetch has no browser-style cookie jar, so each multi-turn case must forward the
// Set-Cookie it got back as the Cookie header on the next turn to stay in the same session.
async function sendTurn(
  history: Array<{ id: string; role: string; content: string }>,
  cookie: string | null,
): Promise<TurnResult | null> {
  const res = await fetch(`${BASE_URL}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: JSON.stringify({ messages: history }),
  });

  if (!res.ok || !res.body) {
    // Draining (not just discarding) the body matters here: an unconsumed Response leaves the
    // underlying connection unreleased, which stalls the next request on Node's fetch
    // connection pool -- discovered by this exact suite hanging after ~5 requests instead of
    // failing fast.
    await res.body?.cancel();
    return null;
  }

  const setCookie = res.headers.get("set-cookie");
  const nextCookie = setCookie ? setCookie.split(";")[0] : cookie;

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let reply = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const payload = line.slice(6).trim();
      if (payload === "" || payload === "[DONE]") continue;
      const parsed = JSON.parse(payload) as { text?: string };
      if (parsed.text) reply += parsed.text;
    }
  }

  return { reply, cookie: nextCookie };
}

async function runCase(testCase: DomainCase): Promise<{ pass: boolean; detail: string } | "skipped"> {
  const history: Array<{ id: string; role: string; content: string }> = [];
  const replies: string[] = [];
  let cookie: string | null = null;

  for (const userMessage of testCase.turns) {
    history.push({ id: crypto.randomUUID(), role: "user", content: userMessage });
    const result = await sendTurn(history, cookie);
    if (result === null) return "skipped";
    cookie = result.cookie;
    history.push({ id: crypto.randomUUID(), role: "assistant", content: result.reply });
    replies.push(result.reply);
  }

  return testCase.grade(replies);
}

async function main() {
  let passed = 0;
  let failed = 0;
  let skipped = 0;

  for (const testCase of CASES) {
    console.log(testCase.id);
    console.log(`  ${testCase.description}`);

    try {
      const result = await runCase(testCase);
      if (result === "skipped") {
        console.log(`  SKIPPED  /api/chat did not return a usable reply (no ANTHROPIC_API_KEY, or ${BASE_URL} is unreachable)`);
        skipped++;
      } else if (result.pass) {
        console.log(`  PASS  ${result.detail}`);
        passed++;
      } else {
        console.log(`  FAIL  ${result.detail}`);
        failed++;
      }
    } catch (error) {
      console.log(`  ERROR  ${error instanceof Error ? error.message : String(error)}`);
      failed++;
    }
  }

  console.log(`\n${passed} passed, ${failed} failed, ${skipped} skipped`);
  if (skipped === CASES.length) {
    console.log("All cases skipped -- expected without a real ANTHROPIC_API_KEY, not a failure.");
  }
  if (failed > 0) process.exit(1);
}

main();
