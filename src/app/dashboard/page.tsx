import Link from "next/link";
import { ActivityList, FunnelBars, StatCard, getOverviewStats } from "@/features/dashboard";

export default async function DashboardOverviewPage() {
  const stats = await getOverviewStats();

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-xl font-semibold text-brand">Overview</h1>
        <p className="mt-1 text-sm text-foreground/60">
          Live snapshot of leads, agent applications, and recent activity.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total leads" value={stats.totalLeads} href="/dashboard/leads" />
        <StatCard label="Agent applications" value={stats.totalAgentApplications} href="/dashboard/agents" />
        <StatCard
          label="SLA breaches (24h)"
          value={stats.slaBreachesLast24h}
          href="/dashboard/activity"
          emphasize={stats.slaBreachesLast24h > 0}
        />
      </div>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground/50">Lead funnel</h2>
        <FunnelBars counts={stats.stageCounts.map((c) => ({ label: c.stage, count: c.count }))} />
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground/50">Agent pipeline</h2>
        <FunnelBars counts={stats.agentStatusCounts.map((c) => ({ label: c.status, count: c.count }))} />
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground/50">Recent activity</h2>
          <Link href="/dashboard/activity" className="text-xs font-medium text-brand hover:underline">
            View all
          </Link>
        </div>
        <ActivityList events={stats.recentActivity} />
      </section>
    </div>
  );
}
