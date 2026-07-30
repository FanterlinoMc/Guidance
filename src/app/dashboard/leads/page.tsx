import { LeadsTable, getLeadsView } from "@/features/dashboard";

export default async function LeadsPage() {
  const leads = await getLeadsView();

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-xl font-semibold text-brand">Leads</h1>
        <p className="mt-1 text-sm text-foreground/60">{leads.length} total.</p>
      </header>
      <LeadsTable leads={leads} />
    </div>
  );
}
