import Link from "next/link";
import { notFound } from "next/navigation";
import { LeadDetailView, getLeadDetail } from "@/features/dashboard";

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lead = await getLeadDetail(id);

  if (!lead) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <Link href="/dashboard/leads" className="text-sm text-brand hover:underline">
        ← Back to leads
      </Link>
      <LeadDetailView lead={lead} />
    </div>
  );
}
