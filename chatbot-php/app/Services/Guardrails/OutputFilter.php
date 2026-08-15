<?php

namespace App\Services\Guardrails;

final class OutputFilter
{
    private const FALLBACK_MESSAGE = 'Let me connect you with an Account Executive who can give you specifics on that.';

    private const LEAK_MESSAGE = 'Let me connect you with an Account Executive who can help with that.';

    // Guidance's own published contact addresses (e.g. reasignup@guidancehomeservices.com,
    // which the system prompt tells the model to hand out to REAs signing up) aren't a PII
    // leak -- only an email at some OTHER domain indicates the model echoed back a visitor's
    // own address.
    private const GUIDANCE_EMAIL_DOMAIN = '/@guidancehomeservices\.com\b/i';

    private const VIOLATION_PATTERNS = [
        Patterns::RATE_QUOTE,
        Patterns::APPROVAL_GUARANTEE,
        Patterns::CLOSING_GUARANTEE,
        Patterns::SSN,
        Patterns::CREDIT_CARD,
        Patterns::PHONE,
        Patterns::ACCOUNT_NUMBER,
    ];

    /** @var InternalLeakDetector */
    private $leakDetector;

    public function __construct(InternalLeakDetector $leakDetector)
    {
        $this->leakDetector = $leakDetector;
    }

    /**
     * Defense-in-depth on top of the system prompt's own prohibitions -- catches cases where the
     * model slips past its instructions before the reply ships.
     *
     * @param array<int, array{text: string, visibility: string}> $retrievedChunks
     */
    public function check(string $message, array $retrievedChunks = []): GuardrailResult
    {
        if ($this->leakDetector->detect($message, $retrievedChunks)) {
            return GuardrailResult::block('INTERNAL_CONTENT_LEAK_BLOCKED', self::LEAK_MESSAGE);
        }

        $violated = $this->matchesAnyViolationPattern($message)
            || $this->leaksNonGuidanceEmail($message)
            || $this->disclosesReferralFee($message);

        if (! $violated) {
            return GuardrailResult::allow();
        }

        return GuardrailResult::block('GUARDRAIL_TRIGGERED', self::FALLBACK_MESSAGE);
    }

    private function matchesAnyViolationPattern(string $message): bool
    {
        foreach (self::VIOLATION_PATTERNS as $pattern) {
            if (preg_match($pattern, $message)) {
                return true;
            }
        }

        return false;
    }

    private function leaksNonGuidanceEmail(string $message): bool
    {
        if (! preg_match(Patterns::EMAIL, $message, $match)) {
            return false;
        }

        return ! preg_match(self::GUIDANCE_EMAIL_DOMAIN, $match[0]);
    }

    // A fixed-width gap between "fee" and "agent" missed real phrasings ("a fee from the real
    // estate agent/broker"), so this checks per-sentence instead: any sentence naming both a
    // fee/commission and an agent/broker/realtor alongside a compensation verb is a disclosure,
    // regardless of word order or how many words sit between them.
    private function disclosesReferralFee(string $message): bool
    {
        if (preg_match(Patterns::REFERRAL_FEE_PHRASE, $message)) {
            return true;
        }

        $sentences = preg_split('/(?<=[.?!])\s+/', $message) ?: [];

        foreach ($sentences as $sentence) {
            if (preg_match(Patterns::FEE_OR_COMMISSION_TERM, $sentence)
                && preg_match(Patterns::AGENT_OR_BROKER_TERM, $sentence)
                && preg_match(Patterns::COMPENSATION_VERB, $sentence)
            ) {
                return true;
            }
        }

        return false;
    }
}
