import { listCapturedFields } from "@/features/lead-extraction";
import { listLeads } from "@/features/lead-lifecycle";
import type { LeadRow } from "./types";

export async function getLeadsView(): Promise<LeadRow[]> {
  const [leads, capturedFields] = await Promise.all([listLeads(), listCapturedFields()]);

  return leads
    .map((lead) => ({ ...lead, ...capturedFields.get(lead.id) }))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
