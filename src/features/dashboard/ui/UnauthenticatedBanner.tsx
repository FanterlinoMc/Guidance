// Step 5/7 (Supabase Auth + Postgres) haven't landed yet, so nothing gates who can load these
// pages. This is a visible flag for that gap, not a substitute for it -- remove once real
// per-role auth is wired in (see EXTERNAL_ACCOUNTS_SETUP.md's DATABASE_URL section).
export function UnauthenticatedBanner() {
  return (
    <div className="border-b border-amber-300 bg-amber-50 px-6 py-2 text-center text-xs font-medium text-amber-900">
      Internal tool — no access control yet, pending Supabase auth. Do not share this URL.
    </div>
  );
}
