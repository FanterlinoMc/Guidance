<?php

namespace App\Services\Guardrails;

final class InputFilter
{
    private const PII_REFUSAL = "I can't accept SSNs, account numbers, or other sensitive identifiers in chat. "
        . 'Please use the secure pre-qualification form instead.';

    private const INJECTION_REFUSAL = 'I can only help with questions about Guidance Home Services financing.';

    public function check(string $message): GuardrailResult
    {
        if (preg_match(Patterns::SSN, $message) || preg_match(Patterns::CREDIT_CARD, $message)) {
            return GuardrailResult::block('PII_DETECTED', self::PII_REFUSAL);
        }

        foreach (Patterns::INJECTION as $pattern) {
            if (preg_match($pattern, $message)) {
                return GuardrailResult::block('GUARDRAIL_TRIGGERED', self::INJECTION_REFUSAL);
            }
        }

        return GuardrailResult::allow();
    }
}
