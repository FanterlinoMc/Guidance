<?php

namespace App\Services\Routing;

use App\Services\Audit\AuditLogger;

// Ported from lead-routing/logic/handle-sla-breach.ts. Stands in for "missed SLA auto-
// reassigns": detects the breach and logs it for whoever owns reassignment to act on. Doesn't
// pick a new assignee from a live AE roster/queue -- no such roster exists in this codebase
// either, so faking a reassignment target would be inventing data with no source.
final class HandleSlaBreach
{
    /** @var ComputeSlaDeadline */
    private $computeSlaDeadline;

    /** @var AuditLogger */
    private $auditLogger;

    public function __construct(ComputeSlaDeadline $computeSlaDeadline, AuditLogger $auditLogger)
    {
        $this->computeSlaDeadline = $computeSlaDeadline;
        $this->auditLogger = $auditLogger;
    }

    /**
     * @param array{leadId: string, tier: string, dueBy: string} $deadline
     */
    public function handle(array $deadline): bool
    {
        $breached = $this->computeSlaDeadline->isBreached($deadline);
        if ($breached) {
            $this->auditLogger->logEvent('SLA_BREACHED', [
                'leadId' => $deadline['leadId'],
                'tier' => $deadline['tier'],
                'dueBy' => $deadline['dueBy'],
            ]);
        }

        return $breached;
    }
}
