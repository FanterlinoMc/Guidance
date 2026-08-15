<?php

namespace App\Services\Guardrails;

// NOTE (Step 29/30 in the TS original): every pattern here is English-only. The system prompt
// instructs Claude to reply in the visitor's detected language, so these code-level checks are
// NOT a real defense-in-depth layer for a rate quote, approval guarantee, etc. phrased in
// Arabic/Urdu/Bengali/Somali/French -- only the prompt-level instruction covers those today.
final class Patterns
{
    public const SSN = '/\b\d{3}-\d{2}-\d{4}\b/';
    public const CREDIT_CARD = '/\b(?:\d[ -]?){13,16}\b/';
    public const EMAIL = '/\b[\w.+-]+@[\w-]+\.[a-z]{2,}\b/i';
    public const PHONE = '/\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/';
    public const ACCOUNT_NUMBER = '/\baccount\s*#?\s*\d{6,}\b/i';

    // Heuristic pre-filter, not a substitute for the model's own instruction-following --
    // catches the common/obvious injection attempts and logs them for audit review.
    public const INJECTION = [
        '/ignore (all )?(the )?(previous|prior|above) instructions/i',
        '/disregard (the )?(system prompt|previous instructions)/i',
        '/reveal (your |the )?(system prompt|instructions)/i',
        '/you are now/i',
        '/pretend (you are|to be)/i',
        '/act as if you (are|were)/i',
        '/jailbreak/i',
    ];

    public const RATE_QUOTE = '/\d{1,2}(\.\d{1,3})?\s?%.{0,30}\b(rates?|apr|interest)\b|\b(rates?|apr|interest)\b.{0,30}\d{1,2}(\.\d{1,3})?\s?%/i';
    public const APPROVAL_GUARANTEE = '/\b(guarantee(d)?|you will (qualify|be approved)|100%\s?approv\w*)\b/i';

    // Catches the model disclosing GHS's referral-fee arrangement with agents even when it isn't
    // grounded in retrieved context (i.e. stated from general real-estate-industry knowledge) --
    // the system prompt's own prohibition against this isn't reliable enough on its own. Kept as
    // separate components rather than one combined regex -- OutputFilter checks them per
    // sentence, since a fixed-width gap between "fee" and "agent" misses real phrasings ("a fee
    // from the real estate agent/broker") that put more words between the terms than a fixed
    // character budget could predict.
    public const REFERRAL_FEE_PHRASE = '/\breferral fee\b/i';
    public const FEE_OR_COMMISSION_TERM = '/\b(fee|commission)s?\b/i';
    public const AGENT_OR_BROKER_TERM = '/\b(agent|broker|realtor)s?\b/i';
    public const COMPENSATION_VERB = '/\b(receiv\w*|pay|pays|paid|compensat\w*)\b/i';

    // Must co-occur with a certainty/promise term, not just "close(s/d/ing) in N days" alone --
    // that bare phrasing also covers the prompt's explicitly permitted informational citation
    // ("most loans close in 45 days on average").
    public const CLOSING_GUARANTEE = '/\b(guarantee(d|s)?|promise(d|s)?|definitely|100%|for sure)\b[^.?!]{0,50}\bclos(e|es|ed|ing)\b|\bclos(e|es|ed|ing)\b[^.?!]{0,50}\b(guarantee(d|s)?|promise(d|s)?|definitely|100%|for sure)\b/i';
}
