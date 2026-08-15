<?php

namespace App\Services\Guardrails;

// NOTE: no constructor property promotion / readonly here even though local dev runs PHP 8.1 --
// composer.json's "^7.3" branch must still parse on the host's real PHP 7.3, which has neither
// (promotion is 8.0+, readonly is 8.1+). Same reasoning applies to every class in this rewrite.
final class GuardrailResult
{
    /** @var bool */
    public $allowed;

    /** @var string|null */
    public $reasonCode;

    /** @var string|null */
    public $refusalMessage;

    public function __construct($allowed, $reasonCode = null, $refusalMessage = null)
    {
        $this->allowed = $allowed;
        $this->reasonCode = $reasonCode;
        $this->refusalMessage = $refusalMessage;
    }

    public static function allow(): self
    {
        return new self(true);
    }

    public static function block(string $reasonCode, string $refusalMessage): self
    {
        return new self(false, $reasonCode, $refusalMessage);
    }
}
