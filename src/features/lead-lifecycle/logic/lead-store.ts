import { appendLeadLine } from "../data/lead-log-writer";
import { readLeadLines } from "../data/lead-log-reader";
import type { Lead } from "./types";

// Append-only JSONL + last-write-wins-on-read, same shape as stage-events.jsonl. Replaced an
// in-memory Map that looked like a Step-7 stand-in but wasn't actually usable as one: every
// Next.js route/page compiles into its own module graph, so a Map written by one route (e.g.
// /api/chat) is invisible to another (e.g. /dashboard) even within a single dev server process
// -- confirmed by a route that only reads seeing nothing a sibling route had just written. This
// crosses that boundary via the filesystem instead, which still only works on a shared
// filesystem (local dev, or a single long-running instance) -- on Vercel each route is its own
// function with its own /tmp, so this remains a stopgap pending Step 7's real table, same as
// every other JSONL store here.
export async function saveLead(lead: Lead): Promise<void> {
  await appendLeadLine(lead);
}

export async function getLead(leadId: string): Promise<Lead | undefined> {
  const leads = await listLeads();
  return leads.find((lead) => lead.id === leadId);
}

export async function listLeads(): Promise<Lead[]> {
  const lines = await readLeadLines();
  const latestById = new Map<string, Lead>();
  for (const lead of lines) latestById.set(lead.id, lead);
  return Array.from(latestById.values());
}
