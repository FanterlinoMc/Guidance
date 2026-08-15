<?php

namespace App\Services\Dashboard;

use App\Lead;

// Ported from dashboard/logic/get-lead-detail.ts. Returns the lead plus its stage history
// (oldest first, matching the TS original's stageEvents.map() order). Same redundant-merge note
// as GetLeadsView -- captured fields already live on the leads row in this port.
final class GetLeadDetail
{
    /**
     * @return array{lead: Lead, stageHistory: array<int, array{fromStage: string|null, toStage: string, timestamp: string}>}|null
     */
    public function get(string $leadId): ?array
    {
        $lead = Lead::find($leadId);
        if ($lead === null) {
            return null;
        }

        $stageHistory = $lead->stageEvents()->orderBy('created_at')->get()->map(function ($event) {
            return [
                'fromStage' => $event->from_stage,
                'toStage' => $event->to_stage,
                'timestamp' => $event->created_at,
            ];
        })->all();

        return ['lead' => $lead, 'stageHistory' => $stageHistory];
    }
}
