import { logEvent } from "@/features/audit-log";
import { checkInput } from "./input-filter";
import { checkOutput } from "./output-filter";
import type { GuardrailResult } from "./types";

export async function runInputGuardrail(message: string, sessionId?: string): Promise<GuardrailResult> {
  const result = checkInput(message);
  if (!result.allowed && result.reasonCode) {
    await logEvent(result.reasonCode, { stage: "input" }, sessionId);
  }
  return result;
}

export async function runOutputGuardrail(message: string, sessionId?: string): Promise<GuardrailResult> {
  const result = checkOutput(message);
  if (!result.allowed && result.reasonCode) {
    await logEvent(result.reasonCode, { stage: "output" }, sessionId);
  }
  return result;
}
