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
