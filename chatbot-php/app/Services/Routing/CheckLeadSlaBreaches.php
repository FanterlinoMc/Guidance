<?php

namespace App\Services\Routing;

use App\AuditLog;
use App\Lead;
use App\StageEvent;
use Carbon\Carbon;

// NOTE: the TS original never actually calls handleSlaBreach() from anywhere -- no scheduler/
// cron infrastructure exists in that codebase (or this one) to drive it, so it was orphaned code
// with a real function but no caller. This wires it into something real: called from the leads
// dashboard page load, it checks every lead still waiting on a human follow-up (captured or
// ae-assigned, not yet contacted -- past that stage a human already did follow up) and logs a
// breach the first time one is found. Idempotent via AuditLog itself: a lead with an existing
// SLA_BREACHED entry is skipped, so revisiting the page doesn't spam duplicate log rows.
final class CheckLeadSlaBreaches
{
    // Stages where a lead is captured but a human hasn't followed up yet -- the SLA clock is
    // still running. Once a lead reaches "contacted" or later, the SLA has been met.
    private const AWAITING_CONTACT_STAGES = ['captured', 'ae-assigned'];

    /** @var ComputeSlaDeadline */
    private $computeSlaDeadline;

    /** @var HandleSlaBreach */
    private $handleSlaBreach;

    public function __construct(ComputeSlaDeadline $computeSlaDeadline, HandleSlaBreach $handleSlaBreach)
    {
        $this->computeSlaDeadline = $computeSlaDeadline;
        $this->handleSlaBreach = $handleSlaBreach;
    }

    public function checkAll(): void
    {
        $alreadyBreachedLeadIds = $this->alreadyBreachedLeadIds();

        $leads = Lead::whereIn('stage', self::AWAITING_CONTACT_STAGES)->get();
        foreach ($leads as $lead) {
            if (in_array($lead->id, $alreadyBreachedLeadIds, true)) {
                continue;
            }

            $capturedAt = $this->capturedAt($lead->id);
            if ($capturedAt === null) {
                continue;
            }

            $deadline = $this->computeSlaDeadline->compute($lead, $capturedAt);
            $this->handleSlaBreach->handle($deadline);
        }
    }

    /**
     * @return string[]
     */
    private function alreadyBreachedLeadIds(): array
    {
        return AuditLog::where('reason_code', 'SLA_BREACHED')
            ->get()
            ->map(function (AuditLog $event) {
                return $event->detail['leadId'] ?? null;
            })
            ->filter()
            ->values()
            ->all();
    }

    private function capturedAt(string $leadId): ?Carbon
    {
        $event = StageEvent::where('lead_id', $leadId)->where('to_stage', 'captured')->first();

        return $event !== null ? $event->created_at : null;
    }
}
