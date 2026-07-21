import { advanceLeadStage, getLead } from "@/features/lead-lifecycle";
import { extractLeadFields } from "./extract-lead-fields";
import { mergeLeadFields } from "./merge-lead-fields";
import type { ExtractedLeadFields } from "./types";

// In-memory stand-in for Step 7's real table, mirroring lead-lifecycle's lead-store pattern.
const capturedFieldsByLeadId = new Map<string, ExtractedLeadFields>();
const leadIdByEmail = new Map<string, string>();

export interface CaptureLeadFieldsResult {
  fields: ExtractedLeadFields;
  isDuplicateEmail: boolean;
  duplicateOfLeadId?: string;
}

// Extracts contact fields from a message, merges them into what's already captured for this
// lead, flags an email already tied to a different lead ("dedupe by email"), and advances the
// lead to "captured" the first time either email or phone lands ("advance stage").
export async function captureLeadFields(leadId: string, message: string): Promise<CaptureLeadFieldsResult> {
  const newFields = extractLeadFields(message);
  const existingFields = capturedFieldsByLeadId.get(leadId) ?? {};
  const hadContactInfo = Boolean(existingFields.email || existingFields.phone);

  const mergedFields = mergeLeadFields(existingFields, newFields);
  capturedFieldsByLeadId.set(leadId, mergedFields);

  let isDuplicateEmail = false;
  let duplicateOfLeadId: string | undefined;
  if (newFields.email) {
    const existingLeadId = leadIdByEmail.get(newFields.email);
    if (existingLeadId && existingLeadId !== leadId) {
      isDuplicateEmail = true;
      duplicateOfLeadId = existingLeadId;
    } else {
      leadIdByEmail.set(newFields.email, leadId);
    }
  }

  const hasContactInfoNow = Boolean(mergedFields.email || mergedFields.phone);
  if (!hadContactInfo && hasContactInfoNow && getLead(leadId)) {
    await advanceLeadStage(leadId, "captured");
  }

  return { fields: mergedFields, isDuplicateEmail, duplicateOfLeadId };
}
