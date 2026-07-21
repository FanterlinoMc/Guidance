# External accounts setup

What's blocked on an external account or credential, what turns on automatically once it's
set, and what still needs building or verifying after. Ordered by how independent each item is
— most of these can be provisioned in any order.

## ANTHROPIC_API_KEY

**What**: an Anthropic API key with access to `claude-opus-4-8`.
**Set**: `ANTHROPIC_API_KEY` in `.env.local` (or the host's env config in production).

**Turns on automatically**: `/api/chat` starts returning real model replies instead of 503
`UPSTREAM_UNAVAILABLE`. See `src/features/chat-api/logic/call-claude.ts`.

**Still needs doing after**:
- Run `npm run test:domain` (`tests/evals/domain.eval.ts`) and `npm run test:guardrails`
  against a live `npm run dev` — both currently report SKIPPED without this key, and this is
  the first point they can actually grade anything.
- Confirm the model choice. `src/features/chat-api/logic/claude-model.ts` hardcodes
  `claude-opus-4-8`. That's Anthropic's current recommended default, but it's a real
  cost/quality tradeoff for a high-volume consumer-facing widget — `claude-sonnet-5` is the
  cheaper alternative. This was flagged during the build and left as Opus by default; revisit
  before high production volume.
- Watch spend once live; there's no token/cost cap in this codebase today, only the request-rate
  limiter in `src/features/rate-limit`.

## OPENAI_API_KEY / PINECONE_API_KEY / PINECONE_INDEX_NAME

**What**: an OpenAI key for embeddings and a Pinecone project for the vector index (Steps
11/12).
**Status**: **not wired up.** `getOpenAiApiKey()` / `getPineconeApiKey()` exist in
`src/core/env/server-env.ts` but nothing calls them yet.

**Turns on automatically**: nothing. Setting these keys alone changes no runtime behavior.

**Still needs building after**:
- `retrieveContext()` (`src/features/retrieval/logic/retrieve-context.ts`) currently runs a
  TF-IDF stub over the scraped corpus loaded by `load-corpus.ts` — verified working, not a
  placeholder that silently fails, just not embeddings-based semantic search.
- The real work is: an embeddings pipeline (chunk the corpus, call OpenAI embeddings, upsert to
  Pinecone) and a `retrieveContext()` rewrite that queries Pinecone instead of scoring
  in-process. This wasn't written speculatively — an untested integration against an API this
  environment can't reach would be a worse artifact than the working stub it'd replace. Build it
  against OpenAI's and Pinecone's docs directly when the keys exist, and validate the swap the
  same way the TF-IDF stub was validated: run it against the real corpus and check retrieval
  quality, not just that it compiles.
- Preserve `retrieveContext()`'s external contract (`RetrievedChunk[]` with `id` / `visibility`
  / `audience`) — `filterByVisibility()` and the visibility-based default-deny filtering
  (`DEFAULT_ALLOWED_VISIBILITY`) depend on it and must keep working unchanged.

## ALLOWED_ORIGINS

**What**: the production domain(s) the chat widget will be embedded on.
**Set**: `ALLOWED_ORIGINS` in `.env.local` / host env, comma-separated
(`https://guidancehomeservices.com,https://www.guidancehomeservices.com`).

**Turns on automatically**: `/api/chat` starts sending CORS headers for those origins (see
`src/core/security/cors.ts`, wired into `src/app/api/chat/route.ts`). Verified against a live
dev server with a fake `Origin` header — an allowed origin gets
`Access-Control-Allow-Origin` on both the `OPTIONS` preflight and the `POST` response
(including error responses), a disallowed origin gets neither. Leaving it unset is safe: it
just means only same-origin requests work, which is fine if the widget is always served from
the same domain as the API.

**Still needs doing after**: none — this is a pure config flip.

## LEAD_WEBHOOK_URL

**What**: an endpoint to notify on lead-capture events (Step 34).
**Status**: **not wired up**, and no payload shape has been designed. `getLeadWebhookUrl()`
exists in `server-env.ts` but nothing calls it.

**Turns on automatically**: nothing.

**Still needs building after**: once the real receiving system (CRM, Zapier, internal API...)
is known, write the sender in `src/features/lead-lifecycle` gated behind
`getLeadWebhookUrl()`, matching the pattern `call-claude.ts` uses for
`getAnthropicApiKey()` — throw/skip cleanly when unset, call for real when set. The payload
shape should match whatever the receiving system expects, which isn't decidable from this
codebase alone.

## DATABASE_URL (Postgres/Supabase — Step 7)

**What**: a Postgres database (Supabase or otherwise).
**Status**: **not wired up.** `getDatabaseUrl()` exists in `server-env.ts` but nothing calls it.

**Ready now**: `supabase/migrations/0001_initial_schema.sql` — a full base schema
(`leads`, `stage_events`, `agent_records`, `audit_log`, `session_messages`) written
field-for-field against the TypeScript types already in the codebase
(`src/features/lead-lifecycle`, `agent-records`, `audit-log`). Apply it via the Supabase SQL
editor / CLI, or plain `psql -f` against any Postgres instance — it makes no Supabase-specific
assumptions beyond the file's location.

**Turns on automatically**: nothing — applying the schema doesn't change app behavior by
itself.

**Still needs building after**: every feature currently backed by an in-memory `Map` or JSONL
file (`lead-lifecycle/logic/lead-store.ts`, `agent-records/logic/agent-record-store.ts`,
`audit-log/logic/log-event.ts`, plus `stage-event-writer.ts`) needs its store implementation
swapped for real queries against the schema above. Each was deliberately written with a narrow,
swappable function signature for exactly this (e.g. `createLead`, `advanceLeadStage`,
`logEvent`) — callers shouldn't need to change, only the store internals. No ORM is set up; pick
one (or stay on raw SQL via `pg`) as part of that work, not before — CLAUDE.md's "don't
abstract early" applies to this too.
- Step 18 (session transcript persistence) now has a writer
  (`src/features/session-transcript`), but it's the same JSONL stand-in pattern as the others —
  swap it for the `session_messages` table alongside the rest of this work.

## Auth provider (Steps 5, 37 — internal dashboard)

**Status**: deliberately not decided or scaffolded. No dashboard views exist yet (Steps 38-43
are all blocked on Step 37, which is blocked on Steps 5 and 7), so there's nothing concrete to
define real roles/permissions against — guessing an auth library now risks locking in the wrong
one before the thing it protects exists. Decide this together with the user before building
against it; it's a much more expensive-to-reverse choice than the items above.

## Vercel (or other hosting)

**Status**: not blocking anything in this codebase today — there's no `vercel.json` or
deploy-specific config because none has been needed. `next build` (verified this session)
produces a standard Next.js production build that deploys to Vercel with zero extra config
under default settings. Set `NEXT_PUBLIC_APP_URL` to the real deployed URL once known, and
`ALLOWED_ORIGINS` if the widget will be embedded cross-origin from a different domain.
