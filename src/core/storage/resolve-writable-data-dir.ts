import os from "node:os";
import path from "node:path";

// Vercel's serverless functions ship a read-only filesystem outside of /tmp -- writing to
// process.cwd()/data (fine locally) throws EROFS in production. /tmp is per-instance and wiped
// between cold starts, so this only keeps the JSONL writers working as the same "stand-in until
// DATABASE_URL is wired" storage they already were (see EXTERNAL_ACCOUNTS_SETUP.md), not a fix
// for durability.
export function resolveWritableDataDir(...segments: string[]): string {
  const base = process.env.VERCEL ? os.tmpdir() : process.cwd();
  return path.join(base, "data", ...segments);
}
