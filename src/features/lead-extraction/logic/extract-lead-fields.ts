import { EMAIL_PATTERN, PHONE_PATTERN } from "@/features/guardrails";
import type { ExtractedLeadFields } from "./types";

// Only email and phone are reliably regex-extractable from free text. Everything else
// (name/city/timeline) is deferred to Step 17's live model -- see types.ts.
export function extractLeadFields(message: string): ExtractedLeadFields {
  const fields: ExtractedLeadFields = {};

  const emailMatch = message.match(EMAIL_PATTERN);
  if (emailMatch) fields.email = emailMatch[0];

  const phoneMatch = message.match(PHONE_PATTERN);
  if (phoneMatch) fields.phone = phoneMatch[0];

  return fields;
}
