<?php

namespace App\Services\Routing;

use App\Services\Audit\AuditLogger;

// Ported from lead-routing/logic/record-routing-override.ts. A DM (or above) overriding an
// auto-routing decision -- e.g. approving a sub-7-score REA application after manual review. No
// permission check here: same as the original, there's no per-role permission matrix in this
// codebase (see EnsureDashboardRole's own comment), so this only records the override for audit
// purposes rather than pretending to gate who's allowed to call it.
final class RecordRoutingOverride
{
    /** @var AuditLogger */
    private $auditLogger;

    public function __construct(AuditLogger $auditLogger)
    {
        $this->auditLogger = $auditLogger;
    }

    public function record(string $leadId, string $overriddenByRole, string $reason): void
    {
        $this->auditLogger->logEvent('ROUTING_OVERRIDDEN', [
            'leadId' => $leadId,
            'overriddenBy' => $overriddenByRole,
            'reason' => $reason,
        ]);
    }
}
