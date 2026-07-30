import type { ActivityRow } from "../logic/types";
import { EmptyState } from "./EmptyState";
import { formatTimestamp } from "./format-timestamp";

export function ActivityList({ events }: { events: ActivityRow[] }) {
  if (events.length === 0) {
    return <EmptyState message="No activity recorded yet." />;
  }

  return (
    <ul className="mt-3 divide-y divide-black/5 rounded-lg border border-black/5 bg-white shadow-sm">
      {events.map((event) => (
        <li key={event.id} className="flex items-start justify-between gap-4 px-5 py-3">
          <div>
            <p className="text-sm font-medium text-foreground">{formatReasonCode(event.reasonCode)}</p>
            {event.sessionId && (
              <p className="mt-0.5 font-mono text-xs text-foreground/50">session {event.sessionId.slice(0, 8)}</p>
            )}
          </div>
          <time className="shrink-0 text-xs text-foreground/50">{formatTimestamp(event.timestamp)}</time>
        </li>
      ))}
    </ul>
  );
}

function formatReasonCode(code: string): string {
  return code
    .toLowerCase()
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}
