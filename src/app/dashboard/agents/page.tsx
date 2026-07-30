import { AgentsTable, getAgentsView } from "@/features/dashboard";

export default async function AgentsPage() {
  const agents = await getAgentsView();

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-xl font-semibold text-brand">Agent applications</h1>
        <p className="mt-1 text-sm text-foreground/60">{agents.length} total.</p>
      </header>
      <AgentsTable agents={agents} />
    </div>
  );
}
