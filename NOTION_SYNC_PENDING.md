# Pending Notion / Obsidian sync (2026-07-21)

Notion hit its free-plan query quota mid-session; Obsidian's local REST API has been
unreachable all session (app not running). Both are outside my control. This file is the
durable record of what still needs to be written back once either reconnects — delete this
file once the sync is done.

Notion DB: `collection://1449b5bf-141f-45ea-ba77-e2fca3d52aa2` ("Guidance Chatbot — Build
Milestones"). Update via `notion-update-page`, `command: "update_properties"`.

## Already synced to Notion this session
- Step 32 -> In progress (page id `3a1ee4d1-ad46-8145-986a-f4469149bab4`)
- Step 16.1 -> Done (page id `3a3ee4d1-ad46-8160-acef-c5b95557fc9c`)
- Step 9.2 -> Done, Step 13.1 -> Done, Step 9.3 -> In progress, Step 9.1 -> Notes only
  (still Not started) — all synced earlier, before the quota hit.

## Still pending (Notion query quota exhausted before these could be looked up/written)

### Step 33 — Structured lead extraction
Status -> **Done**. Notes: "2026-07-21: src/features/lead-extraction --
extractLeadFields() pulls email/phone via guardrails' shared PII patterns (name/city/timeline
deferred to Step 17's live model, same reasoning as Step 25's intent detection -- not reliably
regex-extractable). captureLeadFields() merges fields onto a lead, dedupes by email across
leads, and auto-advances the lead to 'captured' the first time contact info lands. Verified
28/28 (combined with Steps 35/36) including real dedupe-across-leads and auto-advance
behavior."

### Step 36 — Agent (REA) records
Status -> **Done**. Notes: "2026-07-21: src/features/agent-records -- AgentRecord (license,
part-time, status, score) with a status-transition graph (applied -> screening -> approved ->
onboarded, reject from anywhere non-terminal) and recordAgentScore(). No scoring formula
invented -- score is a human-set field from screening, feeds Step 35's veto threshold (score <
7). Verified 28/28 (combined script)."

### Step 35 — SLA timers + routing rules
Status -> **In progress** (not Done -- see provisional note). Notes: "2026-07-21:
src/features/lead-routing -- computeSlaDeadline() assigns a 1hr ('fast') or 3hr ('standard')
window by lead track, isSlaBreached()/handleSlaBreach() (logs SLA_BREACHED to the audit log --
does NOT fabricate an auto-reassignment target since no real AE roster/queue exists yet),
requiresVeto() (score < 7), recordRoutingOverride() (logs ROUTING_OVERRIDDEN, no permission
check since Step 5's RBAC matrix is still deferred). PROVISIONAL: the 1hr/3hr split by track
(homebuyer=fast, agent=standard) is reconstructed, NOT sourced from the vault's '2025
Concierge process' doc (Obsidian was unreachable while building this) -- reconcile once
Obsidian reconnects. Verified 28/28 (combined script) including a real SLA_BREACHED line
confirmed in data/audit/audit-log.jsonl."

### Step 17 — /api/chat route
Status -> **In progress** (not Done -- see NOTE below, this is a scaffold). Notes: "2026-07-21:
src/app/api/chat/route.ts wires the full turn: input guardrail -> RAG retrieval
(retrieveContextForSession) -> buildSystemMessage -> capConversationHistory -> callClaude ->
output guardrail (checked against retrieved chunks) -> chunked SSE response matching the wire
format chat-widget/logic/sse.ts already expected (Step 22 prep work, built ahead of this
route). Model: claude-opus-4-8 (Anthropic's current default per the claude-api skill -- FLAG
TO USER: prior spec assumed Sonnet-tier; this is a high-volume consumer-facing widget, so the
cost/quality tradeoff should be confirmed with the user, not left as my default). Real call is
gated behind getAnthropicApiKey() -- no key exists in this environment so the live path is
unverified against an actual model response. NOTE (deliberate corner cut): callClaude()
buffers the FULL reply server-side and runs the output guardrail on the complete text before
chunking it out word-by-word to the client -- this is NOT real incremental token streaming.
Traded live per-token streaming for output-guardrail correctness (a leaked excerpt spanning a
chunk boundary must not slip through). Revisit with a safe per-chunk moderation strategy once
there's live traffic to design against. Verified for real against a running next dev server:
valid message -> 503 UPSTREAM_UNAVAILABLE (no internal detail leaked) since no API key; 400 on
malformed body; SSN input -> guardrail short-circuits BEFORE retrieval, 200 SSE with the
refusal message in the correct wire format -- confirmed via the real audit log that retrieval
ran (and was logged) for the valid message and was correctly skipped for the blocked one.
Production build includes the real /api/chat route; guardrail eval suite 12/12 still passes."

### Step 19 — In-session conversation history
Status -> **Done** (upgrade from In progress). Notes append: "2026-07-21: Step 17's route now
actually calls capConversationHistory() as part of real request orchestration -- the 'full
orchestration isn't wired yet' caveat from the 2026-07-20 note no longer applies. Only the
live-model verification remains blocked, and that's a real external-account block
(ANTHROPIC_API_KEY), not a code gap."

### Step 22 — Message rendering + streaming + typing indicator
Status -> stays **Not started** -> move to **In progress**. Notes: "2026-07-21: Client-side
rendering (MessageBubble, TypingIndicator, MessageList, use-chat-session's SSE parsing) already
existed from prior work. This session verified the wire-format contract end-to-end for real
against the live /api/chat route (Step 17) via curl -- confirmed the exact `data:
{\"text\":...}` / `data: [DONE]` format the client parser expects. NOT done: markdown
formatting (bold/links/lists) is not implemented -- MessageBubble renders plain text via JSX
interpolation. The 'no raw HTML' safety property in the milestone gate is already satisfied
(React escapes all interpolated text by default, no dangerouslySetInnerHTML anywhere) -- what's
missing is markdown *formatting*, a UX nicety, not a safety gap. Deliberately not building a
markdown renderer now (avoiding unrequested scope/dependency creep); revisit if/when real
formatted model output makes it worth doing."

### Steps 25/26/27/28 — Phase 4 dual-audience flows
Status -> stays **In progress**, no change needed. Add a note pointer: "2026-07-21: Step 17
now exists, so these are no longer blocked on 'no route to verify against' in principle -- but
real verification still needs a live ANTHROPIC_API_KEY (none in this environment). Structural
verification (prompt sections present, correct content) remains the ceiling until a real key is
available."

### Step 13 — Retrieval function status correction
Notes correction (Status stays Done, just fix the note): the "NOT built: the visibility/audience
filter" line from 2026-07-20 is now STALE -- Step 9.2 (2026-07-21) built and wired that filter
into retrieveContext() for real. Update note to: "Visibility/audience filtering (deferred
2026-07-20) was completed by Step 9.2 on 2026-07-21 -- retrieveContext() now takes an
allowedVisibility option, default-deny ['public']. Only cosine-over-embeddings remains
deferred, blocked on Steps 11/12 (OpenAI + Pinecone)."

### Steps 3, 5 — confirm at honest ceiling, no code changes
Just confirm notes are still accurate (no new info this session): Step 3's CORS is still
deferred, but now with a *more specific* reason -- `/api/chat` exists now, but the real
production domain(s) are still unknown (deployment/Vercel blocked), so a real CORS allowlist
still can't be built honestly. Step 5's permission matrix/MFA/auth provider are still
deferred for the same reasons as before (no auth provider chosen).

### Step 9.1 (for context, not a new update -- already synced)
Still blocked pending the user's answer on whether a real internal document library exists.
Not re-asked this session ("finish all buildable" was not that answer).

## Obsidian vault updates (once reachable)

Append a "2026-07-21" section to `Floorzero/Projects/Guidance-Chatbot/01-Features/*/00-plan.md`
for each touched feature area, mirroring the Notion notes above, in the same style as the
2026-07-20 Phase 0 section already there. Feature areas touched this session: Knowledge Base
and RAG (9.2/9.3/13.1/13-correction), Guardrails/Chat Backend (16.1/17/19), Lead Lifecycle (new
area: 32/33/35/36), Frontend Widget (22).

Also flag in Obsidian, same as Notion: the provisional 10-stage lead lifecycle list (Step 32)
and the provisional 1hr/3hr SLA tier assignment (Step 35) both need reconciling against the
vault's actual authored content once it's reachable again -- I could not read the vault this
session at all.
