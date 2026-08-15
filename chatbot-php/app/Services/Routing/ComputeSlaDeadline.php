<?php

namespace App\Services\Routing;

use App\Lead;
use Carbon\Carbon;

final class ComputeSlaDeadline
{
    private const FAST_SLA_HOURS = 1;

    private const STANDARD_SLA_HOURS = 3;

    /**
     * @return array{leadId: string, tier: string, dueBy: string}
     */
    public function compute(Lead $lead, ?Carbon $capturedAt = null): array
    {
        $capturedAt = $capturedAt ?? now();
        $tier = $lead->track === 'homebuyer' ? 'fast' : 'standard';
        $hours = $tier === 'fast' ? self::FAST_SLA_HOURS : self::STANDARD_SLA_HOURS;
        $dueBy = $capturedAt->copy()->addHours($hours);

        return ['leadId' => $lead->id, 'tier' => $tier, 'dueBy' => $dueBy->toISOString()];
    }

    public function isBreached(array $deadline, ?Carbon $now = null): bool
    {
        $now = $now ?? now();

        return $now->greaterThan(Carbon::parse($deadline['dueBy']));
    }
}
