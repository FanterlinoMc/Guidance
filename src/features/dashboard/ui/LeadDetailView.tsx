import type { LeadDetail } from "../logic/types";
import { Badge } from "./Badge";
import { stageTone } from "./badge-tones";
import { formatTimestamp } from "./format-timestamp";

export function LeadDetailView({ lead }: { lead: LeadDetail }) {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-black/5 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-brand">
            {lead.name ?? lead.email ?? lead.phone ?? "Unidentified lead"}
          </h2>
          <Badge tone={stageTone(lead.stage)}>{lead.stage}</Badge>
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
          <Field label="Track" value={lead.track} />
          <Field label="Email" value={lead.email} />
          <Field label="Phone" value={lead.phone} />
          <Field label="City" value={lead.city} />
          <Field label="Timeline" value={lead.timeline} />
          <Field label="Session" value={lead.sessionId.slice(0, 8)} mono />
        </dl>
      </div>

      <div className="rounded-lg border border-black/5 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground/50">Stage history</h3>
        <ol className="mt-3 space-y-2">
          {lead.stageHistory.map((event, index) => (
            <li key={index} className="flex items-center gap-3 text-sm">
              <span className="font-medium text-foreground/80">
                {event.fromStage ? `${event.fromStage} → ${event.toStage}` : `Started at ${event.toStage}`}
              </span>
              <span className="text-xs text-foreground/50">{formatTimestamp(event.timestamp)}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value?: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-foreground/40">{label}</dt>
      <dd className={`mt-0.5 text-foreground/80 ${mono ? "font-mono text-xs" : ""}`}>{value ?? "—"}</dd>
    </div>
  );
}
