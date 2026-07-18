# Project Folders Structure Blueprint — Guidance AI Chatbot

Next.js 14 (App Router, TypeScript). Organized **feature-first** per `CLAUDE.md` — `app/` is thin
routing glue only; all business logic lives in `src/features/*`; only genuinely cross-feature code
lives in `src/core/`.

## Tree

```
guidance-chatbot/
├── app/                          # Next.js routes only — no business logic
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   └── api/
│       ├── health/route.ts
│       └── chat/route.ts         # thin adapter → src/features/chat-api
├── src/
│   ├── features/
│   │   ├── chat-api/             # /api/chat orchestration (the hub)
│   │   │   ├── data/             # Anthropic client, message types
│   │   │   ├── logic/            # assemble prompt, stream, post-stream hooks
│   │   │   └── index.ts          # public entry: handleChatRequest()
│   │   ├── chat-widget/          # frontend chat UI
│   │   │   ├── ui/               # ChatWidget, MessageList, QuickReplies, TypingIndicator
│   │   │   ├── logic/            # useChatSession hook, persistence
│   │   │   └── index.ts
│   │   ├── rag/                  # retrieval
│   │   │   ├── data/             # Pinecone client, embeddings client
│   │   │   ├── logic/            # retrieveContext()
│   │   │   └── index.ts
│   │   ├── scraping/             # knowledge-base ingestion (build-time tooling)
│   │   │   ├── data/             # site configs / URL lists
│   │   │   ├── logic/            # scrape, clean, chunk
│   │   │   └── index.ts
│   │   ├── system-prompt/
│   │   │   ├── logic/            # buildSystemMessage()
│   │   │   └── index.ts
│   │   ├── guardrails/           # Guardrail Gateway
│   │   │   ├── logic/            # input filters, injection checks, output sanitization
│   │   │   └── index.ts
│   │   ├── multilingual/
│   │   │   ├── logic/            # detectLanguage(), isRTL()
│   │   │   └── index.ts
│   │   ├── lead-capture/
│   │   │   ├── data/             # webhook client
│   │   │   ├── logic/            # extractLeadIntent(), postLead()
│   │   │   └── index.ts
│   │   ├── audit-log/            # append-only audit log
│   │   │   ├── data/             # JSONL writer (DB-backed later)
│   │   │   ├── logic/            # logEvent(reasonCode, payload)
│   │   │   └── index.ts
│   │   └── rate-limit/
│   │       ├── logic/            # limiter(ip)
│   │       └── index.ts
│   └── core/                     # only what's shared by 2+ features
│       ├── theme/                # brand tokens, Tailwind extensions
│       ├── components/           # feature-agnostic reusable UI
│       ├── utils/
│       └── errors/
├── scripts/                      # run via tsx: embed.ts, scrape-run.ts, chunk-run.ts
├── data/scraped/                 # guidance-chunks.json
├── tests/evals/                  # 7 domain evals, 8 guardrail tests, multilingual suite
├── .env.local.example
├── CLAUDE.md
└── README.md
```

## Rules

- `app/api/*/route.ts` parses the request, calls the owning feature's `index.ts` export, and
  returns the response. No retrieval/prompt/guardrail logic in `app/`.
- Each feature exposes one `index.ts` barrel. Code outside a feature never imports from that
  feature's `data/` or `logic/` directly — only from its `index.ts`.
- A feature only gets the sub-folders it needs (e.g. `system-prompt` has no `data/` or `ui/`) —
  don't create empty layer folders.
- Promote something to `core/` only once a second feature needs it.
- Build-time tooling (`scripts/`) may import feature `logic/` directly since it isn't part of the
  runtime request path.

_Last updated: 2026-07-19, alongside the Step 1 scaffold._
