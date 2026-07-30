import Link from "next/link";

interface StatCardProps {
  label: string;
  value: number;
  href: string;
  emphasize?: boolean;
}

export function StatCard({ label, value, href, emphasize }: StatCardProps) {
  return (
    <Link
      href={href}
      className="block rounded-lg border border-black/5 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <p className="text-xs font-medium uppercase tracking-wide text-foreground/50">{label}</p>
      <p className={`mt-2 font-mono text-3xl font-semibold ${emphasize ? "text-red-600" : "text-brand"}`}>{value}</p>
    </Link>
  );
}
