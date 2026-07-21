// 7 domain-competence evals, distinct from tests/evals/guardrails.eval.ts (which checks the 8
// hard prohibitions). These check that the assistant actually *does its job* well -- grounds
// answers, follows the lead-capture order, escalates on frustration, replies in kind -- not
// just that it avoids forbidden claims. Each case needs a real model turn to grade, so this
// hits the real /api/chat route over HTTP (same path a browser would use) rather than importing
// server-only-gated code directly. Requires `npm run dev` (or `next start`) running at
// EVAL_BASE_URL (default http://localhost:3100). With no ANTHROPIC_API_KEY -- this
// environment's real state -- /api/chat returns 503 for every case, so every case reports
// SKIPPED rather than faking a pass. Run with `npm run test:domain`.

const BASE_URL = process.env.EVAL_BASE_URL ?? "http://localhost:3100";

interface DomainCase {
  id: string;
  description: string;
  turns: string[]; // user messages, sent one at a time to build a multi-turn conversation
  grade: (replies: string[]) => { pass: boolean; detail: string };
}

const CASES: DomainCase[] = [
  {
    id: "1. Musharakah explanation is grounded",
    description: "A co-ownership question should cite the retrieved context, not invent details.",
    turns: ["What is Musharakah Mutanaqisa and how is it different from a regular mortgage?"],
    grade: (replies) => {
      const text = replies[0].toLowerCase();
      const pass = text.includes("musharakah") && (text.includes("co-own") || text.includes("ownership"));
      return { pass, detail: `Reply should reference Musharakah and co-ownership. Got: "${replies[0].slice(0, 200)}"` };
    },
  },
  {
    id: "2. Investment questions redirect, don't advise",
    description: "Investment questions should redirect to guidanceinvestments.com, not give advice.",
    turns: ["Should I put my retirement savings into Guidance Investments funds?"],
    grade: (replies) => {
      const text = replies[0].toLowerCase();
      const pass = text.includes("guidanceinvestments.com") || text.includes("account executive");
      return { pass, detail: `Reply should redirect to guidanceinvestments.com or an AE. Got: "${replies[0].slice(0, 200)}"` };
    },
  },
  {
    id: "3. Competitor comparisons stay neutral",
    description: "Asked to compare against a named competitor, the reply should stay factual, not disparaging.",
    turns: ["Why should I pick Guidance over Lariba?"],
    grade: (replies) => {
      const text = replies[0].toLowerCase();
      const disparaging = ["scam", "bad company", "avoid them", "worse than", "inferior"];
      const pass = !disparaging.some((phrase) => text.includes(phrase));
      return { pass, detail: `Reply should not disparage the competitor. Got: "${replies[0].slice(0, 200)}"` };
    },
  },
  {
    id: "4. Homebuyer lead capture asks one field at a time",
    description: "Once a homebuyer agrees to proceed, the assistant should ask for name/email/phone/city/timeline one at a time, not all at once.",
    turns: ["I'm ready to move forward, can you connect me with someone?", "Sure, my name is Alex Rivera."],
    grade: (replies) => {
      const secondReply = replies[1]?.toLowerCase() ?? "";
      const fieldsAskedTogether = ["email", "phone", "city", "timeline"].filter((field) =>
        secondReply.includes(field),
      ).length;
      const pass = fieldsAskedTogether <= 1;
      return {
        pass,
        detail: `After collecting name, the next ask should be a single field, not several at once. Got: "${replies[1]?.slice(0, 200)}"`,
      };
    },
  },
  {
    id: "5. REA flow screens before offering onboarding",
    description: "An agent/REA visitor should be asked brokerage/market-area screening questions before being routed to onboarding.",
    turns: ["Hi, I'm a real estate agent and I want to join your referral network."],
    grade: (replies) => {
      const text = replies[0].toLowerCase();
      const pass = text.includes("brokerage") || text.includes("market");
      return { pass, detail: `Reply should ask a screening question (brokerage/market area). Got: "${replies[0].slice(0, 200)}"` };
    },
  },
  {
    id: "6. Frustration triggers escalation",
    description: "A visitor repeating a question and expressing frustration should get a human-handoff offer, not another canned redirect.",
    turns: [
      "What's your interest rate?",
      "I already asked, just tell me the rate, this is frustrating.",
    ],
    grade: (replies) => {
      const secondReply = replies[1]?.toLowerCase() ?? "";
      const pass =
        secondReply.includes("account executive") || secondReply.includes("connect you") || secondReply.includes("human");
      return { pass, detail: `Second reply should offer to connect with a human. Got: "${replies[1]?.slice(0, 200)}"` };
    },
  },
  {
    id: "7. Replies in the visitor's language",
    description: "A message in Arabic should get an Arabic-language reply, not an English one.",
    turns: ["ما هي الرسوم المرتبطة بالتمويل العقاري؟"],
    grade: (replies) => {
      const arabicCharPattern = /[؀-ۿ]/;
      const pass = arabicCharPattern.test(replies[0]);
      return { pass, detail: `Reply should contain Arabic script. Got: "${replies[0].slice(0, 200)}"` };
    },
  },
];

// Sends one turn to the real /api/chat route and reconstructs the full reply from the SSE
// wire format (see src/features/chat-api/logic/build-sse-stream.ts). Returns null on any
// non-200 response (e.g. 503 UPSTREAM_UNAVAILABLE with no ANTHROPIC_API_KEY) so the caller can
// treat that as "can't grade this environment", not a crash.
async function sendTurn(sessionId: string, history: Array<{ id: string; role: string; content: string }>): Promise<string | null> {
  const res = await fetch(`${BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, messages: history }),
  });

  if (!res.ok || !res.body) {
    // Draining (not just discarding) the body matters here: an unconsumed Response leaves the
    // underlying connection unreleased, which stalls the next request on Node's fetch
    // connection pool -- discovered by this exact suite hanging after ~5 requests instead of
    // failing fast.
    await res.body?.cancel();
    return null;
  }

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

  return reply;
}

async function runCase(testCase: DomainCase): Promise<{ pass: boolean; detail: string } | "skipped"> {
  const sessionId = `domain-eval-${testCase.id}-${Date.now()}`;
  const history: Array<{ id: string; role: string; content: string }> = [];
  const replies: string[] = [];

  for (const userMessage of testCase.turns) {
    history.push({ id: crypto.randomUUID(), role: "user", content: userMessage });
    const reply = await sendTurn(sessionId, history);
    if (reply === null) return "skipped";
    history.push({ id: crypto.randomUUID(), role: "assistant", content: reply });
    replies.push(reply);
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
