<?php

namespace App\Services\Guardrails;

use App\Services\Audit\AuditLogger;

final class GuardrailGateway
{
    /** @var InputFilter */
    private $inputFilter;

    /** @var OutputFilter */
    private $outputFilter;

    /** @var AuditLogger */
    private $auditLogger;

    public function __construct(InputFilter $inputFilter, OutputFilter $outputFilter, AuditLogger $auditLogger)
    {
        $this->inputFilter = $inputFilter;
        $this->outputFilter = $outputFilter;
        $this->auditLogger = $auditLogger;
    }

    public function runInputGuardrail(string $message, ?string $sessionId = null): GuardrailResult
    {
        $result = $this->inputFilter->check($message);
        $this->logIfBlocked($result, 'input', $sessionId);

        return $result;
    }

    /**
     * @param array<int, array{text: string, visibility: string}> $retrievedChunks
     */
    public function runOutputGuardrail(string $message, ?string $sessionId = null, array $retrievedChunks = []): GuardrailResult
    {
        $result = $this->outputFilter->check($message, $retrievedChunks);
        $this->logIfBlocked($result, 'output', $sessionId);

        return $result;
    }

    private function logIfBlocked(GuardrailResult $result, string $stage, ?string $sessionId): void
    {
        if (! $result->allowed && $result->reasonCode !== null) {
            $this->auditLogger->logEvent($result->reasonCode, ['stage' => $stage], $sessionId);
        }
    }
}
