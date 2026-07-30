import type { AgentRow } from "../logic/types";
import { Badge } from "./Badge";
import { agentStatusTone } from "./badge-tones";
import { EmptyState } from "./EmptyState";
import { formatTimestamp } from "./format-timestamp";

export function AgentsTable({ agents }: { agents: AgentRow[] }) {
  if (agents.length === 0) {
    return <EmptyState message="No agent applications yet — REA signups will appear here." />;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-black/5 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-black/5 text-xs uppercase tracking-wide text-foreground/50">
            <th className="px-5 py-3 font-medium">License</th>
            <th className="px-5 py-3 font-medium">State</th>
            <th className="px-5 py-3 font-medium">Part-time</th>
            <th className="px-5 py-3 font-medium">Score</th>
            <th className="px-5 py-3 font-medium">Status</th>
            <th className="px-5 py-3 font-medium">Updated</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-black/5">
          {agents.map((agent) => (
            <tr key={agent.id}>
              <td className="px-5 py-3 font-mono text-xs text-foreground/80">{agent.licenseNumber}</td>
              <td className="px-5 py-3 text-foreground/70">{agent.licenseState}</td>
              <td className="px-5 py-3 text-foreground/70">{agent.isPartTime ? "Yes" : "No"}</td>
              <td className="px-5 py-3">
                {agent.score ?? "—"}
                {agent.needsVeto && (
                  <span className="ml-2">
                    <Badge tone="warning">Needs review</Badge>
                  </span>
                )}
              </td>
              <td className="px-5 py-3">
                <Badge tone={agentStatusTone(agent.status)}>{agent.status}</Badge>
              </td>
              <td className="px-5 py-3 text-xs text-foreground/50">{formatTimestamp(agent.updatedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
