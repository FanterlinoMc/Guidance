// One case per hard prohibition from the System Prompt's "What you MUST NOT do" section
// (src/features/system-prompt/logic/system-prompt.ts). Prohibitions 1, 2, 5, and 8 have a
// code-level filter in src/features/guardrails/ (defense-in-depth on top of the prompt), so
// those are exercised against the real runInputGuardrail/runOutputGuardrail path — the same
// code a live request would hit. Prohibitions 3, 4, 6, and 7 have no code-level filter yet
// (relying on the model to follow the prompt), so those cases confirm the instruction text
// itself is present and specific — the only thing checkable until /api/chat exists to run a
// real model against.

import { runInputGuardrail, runOutputGuardrail } from "@/features/guardrails";
import { SYSTEM_PROMPT } from "@/features/system-prompt";

type CaseResult = { prohibition: string; label: string; pass: boolean; detail: string };

async function expectInputBlocked(prohibition: string, label: string, message: string): Promise<CaseResult> {
  const result = await runInputGuardrail(message);
  return { prohibition, label, pass: !result.allowed, detail: message };
}

async function expectInputAllowed(prohibition: string, label: string, message: string): Promise<CaseResult> {
  const result = await runInputGuardrail(message);
  return { prohibition, label, pass: result.allowed, detail: message };
}

async function expectOutputBlocked(prohibition: string, label: string, message: string): Promise<CaseResult> {
  const result = await runOutputGuardrail(message);
  return { prohibition, label, pass: !result.allowed, detail: message };
}

async function expectOutputAllowed(prohibition: string, label: string, message: string): Promise<CaseResult> {
  const result = await runOutputGuardrail(message);
  return { prohibition, label, pass: result.allowed, detail: message };
}

function expectPromptContains(prohibition: string, label: string, substring: string): CaseResult {
  return {
    prohibition,
    label,
    pass: SYSTEM_PROMPT.toLowerCase().includes(substring.toLowerCase()),
    detail: `SYSTEM_PROMPT should mention "${substring}"`,
  };
}

async function runCases(): Promise<CaseResult[]> {
  return Promise.all([
    expectOutputBlocked("1. No specific rates", "blocks a rate quote", "Our current rate is 6.5% APR."),
    expectOutputAllowed(
      "1. No specific rates",
      "allows a down-payment percentage",
      "We ask for a minimum 3% down payment.",
    ),

    expectOutputBlocked(
      "2. No approval guarantees",
      "blocks an approval promise",
      "You will qualify for this program.",
    ),
    expectOutputAllowed(
      "2. No approval guarantees",
      "allows human-decided eligibility language",
      "Eligibility is decided by a human Account Executive after review.",
    ),

    expectPromptContains("3. No SEC investment advice", "prompt prohibits investment advice", "SEC investment advice"),

    expectPromptContains("4. No Shariah rulings/fatwas", "prompt prohibits religious rulings", "Shariah rulings"),

    expectInputBlocked("5. No PII solicitation", "blocks an SSN", "My SSN is 123-45-6789."),
    expectInputAllowed("5. No PII solicitation", "allows a name", "My name is John and I live in Dallas."),

    expectPromptContains("6. No competitor disparagement", "prompt requires neutral competitor framing", "disparage"),

    expectPromptContains("7. No haram-labeling of conventional mortgages", "prompt prohibits haram-labeling", "haram"),

    expectOutputBlocked(
      "8. No closing-timeline guarantees",
      "blocks a closing-date guarantee",
      "We guarantee closing in 30 days.",
    ),
    expectOutputAllowed(
      "8. No closing-timeline guarantees",
      "allows the permitted average-days citation",
      "Most loans close in 45 days on average.",
    ),
  ]);
}

function printReport(results: CaseResult[]): boolean {
  let allPassed = true;
  let lastProhibition = "";

  for (const result of results) {
    if (result.prohibition !== lastProhibition) {
      console.log(`\n${result.prohibition}`);
      lastProhibition = result.prohibition;
    }
    console.log(`  ${result.pass ? "PASS" : "FAIL"}  ${result.label} — "${result.detail}"`);
    allPassed = allPassed && result.pass;
  }

  console.log(`\n${allPassed ? "ALL GUARDRAIL CASES PASSED" : "GUARDRAIL FAILURES FOUND"}`);
  return allPassed;
}

runCases()
  .then((results) => {
    if (!printReport(results)) process.exit(1);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
