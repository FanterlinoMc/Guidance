-- Step 7 (database provisioning) base schema. Written against the shapes already implemented
-- as in-memory Maps / append-only JSONL as an explicit Step-7 stand-in:
--   src/features/lead-lifecycle/logic/{lead-store,stage-event-writer}.ts
--   src/features/agent-records/logic/agent-record-store.ts
--   src/features/audit-log/logic/log-event.ts
-- Column names and types mirror each feature's logic/types.ts field-for-field so pointing the
-- app at a real database is a swap of the store implementation, not a schema redesign. Apply
-- via the Supabase SQL editor or `supabase db push` once a project exists; plain Postgres works
-- the same way via `psql -f`. No ORM is assumed -- this is raw DDL so it doesn't force a
-- Prisma/Drizzle choice the app hasn't made.
--
-- lead-routing (SLA deadlines, veto, routing overrides) has no table here: nothing in
-- src/features/lead-routing persists a distinct record today, only computes deadlines on the
-- fly and logs to audit_log. Add one only if that changes.

create extension if not exists pgcrypto;

-- src/features/lead-lifecycle/logic/types.ts: Lead
-- NOTE: LeadStage and LeadTrack are PROVISIONAL (reconstructed pending Obsidian reconciliation
-- -- see the comment atop lead-lifecycle/logic/types.ts). The CHECK constraints below must be
-- updated in lockstep with that union if it changes.
-- lead-extraction's ExtractedLeadFields (email/phone/name/city/timeline) are folded in as
-- nullable columns rather than a separate table: capture-lead-fields.ts merges them onto the
-- same Lead record, there's no independent lifecycle for a "contact fields" entity.
create table leads (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  track text not null check (track in ('homebuyer', 'agent')),
  stage text not null check (stage in (
    'visitor', 'engaged', 'qualified', 'captured', 'ae-assigned',
    'contacted', 'application-started', 'application-in-review', 'approved', 'closed'
  )),
  email text,
  phone text,
  name text,
  city text,
  timeline text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index leads_session_id_idx on leads (session_id);
-- Not unique: capture-lead-fields.ts currently dedupes by email at the application layer and
-- flags collisions rather than rejecting them, so a DB-level unique constraint would fight it.
create index leads_email_idx on leads (email) where email is not null;

-- src/features/lead-lifecycle/logic/types.ts: StageEvent
create table stage_events (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads (id) on delete cascade,
  from_stage text,
  to_stage text not null,
  detail jsonb,
  created_at timestamptz not null default now()
);

create index stage_events_lead_id_idx on stage_events (lead_id);

-- src/features/agent-records/logic/types.ts: AgentRecord
create table agent_records (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads (id) on delete cascade,
  license_number text not null,
  license_state text not null,
  is_part_time boolean not null,
  -- 0-10, set by a human reviewer -- see the same field's comment in logic/types.ts for why no
  -- scoring formula is encoded here.
  score smallint check (score is null or score between 0 and 10),
  status text not null check (status in ('applied', 'screening', 'approved', 'onboarded', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index agent_records_lead_id_idx on agent_records (lead_id);

-- src/features/audit-log/logic/log-event.ts: AuditEvent. reason_code is intentionally not
-- CHECK-constrained against AuditReasonCode -- that union has grown several times already as
-- guardrails/retrieval/routing features were added, and a stale CHECK would reject valid new
-- codes at the DB layer before anyone remembers to migrate it.
create table audit_log (
  id uuid primary key default gen_random_uuid(),
  session_id text,
  reason_code text not null,
  detail jsonb,
  created_at timestamptz not null default now()
);

create index audit_log_session_id_idx on audit_log (session_id);
create index audit_log_reason_code_idx on audit_log (reason_code);

-- Step 18 (session transcript persistence) prep -- Notion lists Step 18 as blocked on this
-- schema, and no app code writes to this table yet (conversation history today lives only in
-- the client's in-session state, capped by src/features/chat-history). Shape follows the
-- ChatMessage type the widget already sends to /api/chat (src/features/chat-api/logic/parse-chat-request.ts).
create table session_messages (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create index session_messages_session_id_idx on session_messages (session_id, created_at);
