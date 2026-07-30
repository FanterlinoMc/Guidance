import { advanceLeadStage, getLead } from "@/features/lead-lifecycle";
import { appendCapturedFieldsLine } from "../data/captured-fields-log-writer";
import { listCapturedFieldsByLead } from "../data/captured-fields-log-reader";
import { extractLeadFields } from "./extract-lead-fields";
import { mergeLeadFields } from "./merge-lead-fields";
import type { ExtractedLeadFields } from "./types";

export interface CaptureLeadFieldsResult {
  fields: ExtractedLeadFields;
  isDuplicateEmail: boolean;
  duplicateOfLeadId?: string;
}

// Extracts contact fields from a message, merges them into what's already captured for this
// lead, flags an email already tied to a different lead ("dedupe by email"), and advances the
// lead to "captured" the first time either email or phone lands ("advance stage"). Backed by
// captured-fields.jsonl (see data/captured-fields-log-*.ts) rather than an in-memory Map --
// same reason as lead-lifecycle's lead-store swap: a Map isn't visible across Next.js route
// boundaries, and the email index is derived on read from that same log rather than kept as a
// second Map, so there's one source of truth instead of two that could drift.
export async function captureLeadFields(leadId: string, message: string): Promise<CaptureLeadFieldsResult> {
  const newFields = extractLeadFields(message);
  const capturedByLead = await listCapturedFieldsByLead();
  const existingFields = capturedByLead.get(leadId) ?? {};
  const hadContactInfo = Boolean(existingFields.email || existingFields.phone);

  const mergedFields = mergeLeadFields(existingFields, newFields);

  let isDuplicateEmail = false;
  let duplicateOfLeadId: string | undefined;
  if (newFields.email) {
    duplicateOfLeadId = findLeadIdByEmail(capturedByLead, newFields.email, leadId);
    isDuplicateEmail = duplicateOfLeadId !== undefined;
  }

  await appendCapturedFieldsLine({ leadId, fields: mergedFields });

  const hasContactInfoNow = Boolean(mergedFields.email || mergedFields.phone);
  if (!hadContactInfo && hasContactInfoNow && (await getLead(leadId))) {
    await advanceLeadStage(leadId, "captured");
  }

  return { fields: mergedFields, isDuplicateEmail, duplicateOfLeadId };
}

export async function getCapturedFields(leadId: string): Promise<ExtractedLeadFields | undefined> {
  const capturedByLead = await listCapturedFieldsByLead();
  return capturedByLead.get(leadId);
}

export async function listCapturedFields(): Promise<Map<string, ExtractedLeadFields>> {
  return listCapturedFieldsByLead();
}

function findLeadIdByEmail(
  capturedByLead: Map<string, ExtractedLeadFields>,
  email: string,
  excludingLeadId: string,
): string | undefined {
  for (const [leadId, fields] of capturedByLead) {
    if (leadId !== excludingLeadId && fields.email === email) return leadId;
  }
  return undefined;
}
