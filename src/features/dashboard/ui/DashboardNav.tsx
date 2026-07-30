"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/leads", label: "Leads" },
  { href: "/dashboard/agents", label: "Agents" },
  { href: "/dashboard/activity", label: "Activity" },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1 bg-brand px-6 py-3">
      <span className="mr-6 text-sm font-semibold tracking-wide text-white">Guidance Internal</span>
      {NAV_LINKS.map((link) => {
        const isActive = link.href === "/dashboard" ? pathname === link.href : pathname?.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
              isActive ? "bg-brand-gold/20 text-brand-gold" : "text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
