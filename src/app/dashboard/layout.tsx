import type { Metadata } from "next";
import { DashboardNav, UnauthenticatedBanner } from "@/features/dashboard";

// Every store this reads (leads, agent records, audit log) changes between requests, so this
// must never be statically prerendered at build time.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Guidance Internal Dashboard",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-brand-paper">
      <UnauthenticatedBanner />
      <DashboardNav />
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}
