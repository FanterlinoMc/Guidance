import { ActivityList, getActivityFeed } from "@/features/dashboard";

const ACTIVITY_PAGE_LIMIT = 200;

export default async function ActivityPage() {
  const events = await getActivityFeed(ACTIVITY_PAGE_LIMIT);

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-xl font-semibold text-brand">Activity</h1>
        <p className="mt-1 text-sm text-foreground/60">Most recent {events.length} audit events.</p>
      </header>
      <ActivityList events={events} />
    </div>
  );
}
