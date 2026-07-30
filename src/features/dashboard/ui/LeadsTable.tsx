import Link from "next/link";
import type { LeadRow } from "../logic/types";
import { Badge } from "./Badge";
import { stageTone } from "./badge-tones";
import { EmptyState } from "./EmptyState";
import { formatTimestamp } from "./format-timestamp";

export function LeadsTable({ leads }: { leads: LeadRow[] }) {
  if (leads.length === 0) {
    return <EmptyState message="No leads yet — they'll appear here once a visitor starts a chat." />;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-black/5 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-black/5 text-xs uppercase tracking-wide text-foreground/50">
            <th className="px-5 py-3 font-medium">Contact</th>
            <th className="px-5 py-3 font-medium">Track</th>
            <th className="px-5 py-3 font-medium">Stage</th>
            <th className="px-5 py-3 font-medium">City</th>
            <th className="px-5 py-3 font-medium">Updated</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-black/5">
          {leads.map((lead) => (
            <tr key={lead.id}>
              <td className="px-5 py-3">
                <Link href={`/dashboard/leads/${lead.id}`} className="font-medium text-brand hover:underline">
                  {lead.name ?? lead.email ?? lead.phone ?? "Unidentified"}
                </Link>
              </td>
              <td className="px-5 py-3 capitalize text-foreground/70">{lead.track}</td>
              <td className="px-5 py-3">
                <Badge tone={stageTone(lead.stage)}>{lead.stage}</Badge>
              </td>
              <td className="px-5 py-3 text-foreground/70">{lead.city ?? "—"}</td>
              <td className="px-5 py-3 text-xs text-foreground/50">{formatTimestamp(lead.updatedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
