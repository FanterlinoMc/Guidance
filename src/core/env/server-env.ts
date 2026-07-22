import "server-only";

// Importing "server-only" makes the build fail loudly if this module ever ends up in a
// client bundle, instead of silently shipping a secret to the browser.

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}. Set it in .env.local (see .env.local.example).`);
  }
  return value;
}

function getOptionalEnv(name: string): string | undefined {
  return process.env[name] || undefined;
}

export function getAnthropicApiKey(): string {
  return getRequiredEnv("ANTHROPIC_API_KEY");
}

export function getOpenAiApiKey(): string {
  return getRequiredEnv("OPENAI_API_KEY");
}

export function getPineconeApiKey(): string {
  return getRequiredEnv("PINECONE_API_KEY");
}

export function getPineconeIndexName(): string {
  return process.env.PINECONE_INDEX_NAME ?? "guidance-corpus";
}

// Optional: lead sync (Step 34) and DB-backed features (Step 7) aren't wired up yet, so
// callers that don't need them shouldn't be forced to have them set.
export function getLeadWebhookUrl(): string | undefined {
  return getOptionalEnv("LEAD_WEBHOOK_URL");
}

export function getDatabaseUrl(): string | undefined {
  return getOptionalEnv("DATABASE_URL");
}

// Optional override for the global rate-limit bucket (src/features/rate-limit/logic/limiter.ts).
// Defaults to 2000/hour if unset -- routed through getOptionalEnv so an empty-string env var
// (the .env.local.example placeholder's actual value) is treated as unset, not as "0".
export function getRateLimitGlobalPerHour(): number {
  const raw = getOptionalEnv("RATE_LIMIT_GLOBAL_PER_HOUR");
  return raw ? Number(raw) : 2000;
}

// Comma-separated list of origins allowed to call /api/chat cross-origin (e.g. the marketing
// site embedding the widget). Unset means no cross-origin caller is trusted -- same-origin
// requests are unaffected, since browsers only enforce CORS on cross-origin ones.
export function getAllowedOrigins(): string[] {
  const raw = getOptionalEnv("ALLOWED_ORIGINS");
  if (!raw) return [];
  return raw
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}
