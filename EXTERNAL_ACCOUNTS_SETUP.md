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

## DATABASE_URL + Supabase Auth (Steps 5, 7 — one account unblocks both)

**Decision made (2026-07-21)**: auth provider is **Supabase Auth**, chosen over Auth.js/NextAuth
and Clerk because a Postgres schema already exists on disk
(`supabase/migrations/0001_initial_schema.sql`) and Supabase bundles Postgres + Auth + row-level
security under one account — a single signup resolves both this blocker and Step 7's, and
built-in TOTP MFA covers Step 5's MFA requirement directly.

**What**: a Supabase project (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).
**Status**: **not wired up.** `getDatabaseUrl()` exists in `server-env.ts` but nothing calls it;
no Supabase client code exists yet.

**Ready now**: `supabase/migrations/0001_initial_schema.sql` — a full base schema
(`leads`, `stage_events`, `agent_records`, `audit_log`, `session_messages`) written
field-for-field against the TypeScript types already in the codebase
(`src/features/lead-lifecycle`, `agent-records`, `audit-log`). Apply it via the Supabase SQL
editor / CLI once a project exists.

**Turns on automatically**: nothing — applying the schema doesn't change app behavior by
itself.

**Still needs building after a real Supabase project exists**:
- **DB side**: every feature currently backed by JSONL files (`lead-lifecycle/logic/lead-store.ts`,
  `agent-records/logic/agent-record-store.ts`, `lead-extraction/logic/capture-lead-fields.ts`,
  `audit-log/logic/log-event.ts`, `stage-event-writer.ts`, and
  `session-transcript/data/transcript-writer.ts`) needs its store implementation swapped for
  real queries against the schema above. Each was deliberately written with a narrow, swappable
  function signature for exactly this (e.g. `createLead`, `advanceLeadStage`, `logEvent`,
  `logSessionMessage`) — callers shouldn't need to change, only the store internals.
  `lead-lifecycle` and `agent-records` started as in-memory `Map`s but were converted to
  append-only JSONL once the dashboard (below) proved a `Map` isn't actually readable across
  Next.js route boundaries — worth knowing if a future feature reaches for a `Map` as a "Step 7
  stand-in" again: it silently doesn't work for anything reading from a different route.
- **Auth side**: real session verification/middleware (`@supabase/supabase-js` or
  `@supabase/ssr`), wired the same way `call-claude.ts` gates on `getAnthropicApiKey()` — no
  code exists yet because building it untested against a project that doesn't exist would be
  the same anti-pattern as Steps 11/12. The internal dashboard (`/dashboard`, see the `dashboard`
  feature) now exists with no access control — it has a visible "unauthenticated" banner instead
  of a fake gate. The permission matrix (which of `concierge`/`ae`/`rm`/`dm`/`admin` can do what)
  is a separate, still-open decision — it can now be defined against the dashboard's real views
  and actions, but role-to-permission boundaries for a GLBA-flagged product are a business call,
  not just an engineering one. Decide that with the user before wiring real auth in.

## Vercel (or other hosting)

**Status**: not blocking anything in this codebase today — there's no `vercel.json` or
deploy-specific config because none has been needed. `next build` (verified this session)
produces a standard Next.js production build that deploys to Vercel with zero extra config
under default settings. Set `NEXT_PUBLIC_APP_URL` to the real deployed URL once known, and
`ALLOWED_ORIGINS` if the widget will be embedded cross-origin from a different domain.
