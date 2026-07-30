# Guidance Chatbot

An AI chat widget for **Guidance Home Services**, a Shariah-compliant home financing company.
It answers visitor questions about Musharakah Mutanaqisa (diminishing co-ownership) financing,
stays inside compliance guardrails (no rate quotes, no fatwas), screens real-estate-agent
visitors separately from consumers, and hands off to a human Account Executive when needed.

Live demo: **https://guidance-tawny.vercel.app**

## Stack

- [Next.js 15](https://nextjs.org) (App Router) + TypeScript + Tailwind CSS
- [Anthropic Claude](https://docs.claude.com) (Sonnet 5) for chat replies, streamed over SSE
- A TF-IDF lexical retrieval stub over a scraped/ingested corpus (stand-in for embeddings —
  see `EXTERNAL_ACCOUNTS_SETUP.md`)
- Feature-first architecture: each capability lives under `src/features/<name>/{data,logic,ui}`

## Getting started

```bash
npm install
cp .env.local.example .env.local   # then fill in ANTHROPIC_API_KEY at minimum
npm run dev
```

Open http://localhost:3000 — the chat widget renders on the demo page. Without a real
`ANTHROPIC_API_KEY`, `/api/chat` returns a 503 (`UPSTREAM_UNAVAILABLE`) instead of live replies.

See `.env.local.example` for the full list of environment variables and
`EXTERNAL_ACCOUNTS_SETUP.md` for what each one unlocks.

## Features

- **Chat widget** (`chat-widget`) — floating launcher, streaming replies, quick-reply /
  suggested-follow-up chips, RTL and multilingual rendering, markdown formatting
- **Guardrails** (`guardrails`) — input guardrail blocks PII/injection before the model sees a
  message; output guardrail blocks rate quotes, approval/closing guarantees, and PII leaks in
  the model's reply
- **Retrieval** (`retrieval`, `rag`) — grounds answers in Guidance's scraped site content and
  internal docs (fatwas, FAQs, SOPs)
- **Lead lifecycle** (`lead-capture`, `lead-extraction`, `lead-lifecycle`, `lead-routing`) —
  structured lead extraction, stage tracking, SLA-timed routing to Account Executives
- **Multilingual** (`multilingual`) — language/script auto-detection (RTL, Urdu, Bengali) driving
  fallback UI copy and reply direction
- **Audit & session logging** (`audit-log`, `session-transcript`) — PII-redacted transcript and
  audit trail, currently JSONL-file-backed pending a real database (see below)
- **Internal dashboard** (`dashboard`) at `/dashboard` — leads funnel, agent/REA pipeline, and
  audit activity feed for internal staff. No access control yet (see below); a visible banner
  flags this in the UI itself

## Testing

```bash
npm run test:guardrails    # guardrail eval suite
npm run test:domain        # domain-competence eval suite
npm run test:resilience    # resilience/error-handling eval suite
npm run test:multilingual  # language-neutral multilingual eval suite
npm run test:markdown      # markdown rendering eval suite
npm run test:rtl           # RTL/script-detection eval suite
```

These evals hit a live `/api/chat` over HTTP (`EVAL_BASE_URL`, default `http://localhost:3100`),
so run `npm run dev` (or point `EVAL_BASE_URL` at a deployed instance) before running them.

## Deployment

Deployed on [Vercel](https://vercel.com), linked to this repo's `Mc` branch — every push
auto-deploys. Required env vars on the Vercel project: `ANTHROPIC_API_KEY` at minimum (see
`.env.local.example` for the rest). Vercel Functions have a read-only filesystem outside of
`/tmp`; the JSONL-backed writers (audit log, lead stage events, session transcripts) detect
`process.env.VERCEL` and fall back to `/tmp` accordingly — see
`src/core/storage/resolve-writable-data-dir.ts`. That's a stopgap, not durable storage: `/tmp` is
wiped between cold starts. Real persistence is pending a Supabase/Postgres account
(`DATABASE_URL`), tracked in `EXTERNAL_ACCOUNTS_SETUP.md`.

## Project structure

See `Project_Folders_Structure_Blueprint.md` for a full folder-by-folder breakdown, and
`CLAUDE.md` for this repo's engineering standards.
