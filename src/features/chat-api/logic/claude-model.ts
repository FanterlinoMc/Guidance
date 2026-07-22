// DECISION (user, 2026-07-22): Sonnet 5 over Opus 4.8/Haiku 4.5 -- this is a high-volume,
// consumer-facing widget where cost scales directly with traffic, but it also enforces
// compliance-sensitive guardrails (Shariah framing, GLBA, no rate/approval promises) where
// quality matters enough to rule out Haiku. Sonnet is the balance point between the two.
export const CLAUDE_MODEL = "claude-sonnet-5";
