<?php

namespace App\Services\Leads;

final class StageTransitions
{
    // The funnel is monotonic: a lead can advance to any later stage (skipping intermediate ones
    // is fine -- e.g. a visitor who submits contact info immediately jumps visitor -> captured)
    // but never regresses. Stage correction, if ever needed, should read as a new lead record,
    // not a backward transition -- that keeps stage_events an honest append-only history.
    public const STAGES = [
        'visitor', 'engaged', 'qualified', 'captured', 'ae-assigned',
        'contacted', 'application-started', 'application-in-review', 'approved', 'closed',
    ];

    public function isValidTransition(?string $fromStage, string $toStage): bool
    {
        if ($fromStage === null) {
            return true;
        }

        // array_search()'s `false` (not found) must never silently compare as "earlier than
        // everything" via PHP's bool-coercion rules -- an unrecognized stage string fails
        // closed instead.
        $fromIndex = array_search($fromStage, self::STAGES, true);
        $toIndex = array_search($toStage, self::STAGES, true);
        if ($fromIndex === false || $toIndex === false) {
            return false;
        }

        return $toIndex > $fromIndex;
    }
}
