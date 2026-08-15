<?php

namespace App\Services\Leads;

use App\Lead;
use App\StageEvent;
use Illuminate\Support\Facades\DB;

final class CreateLead
{
    public function create(string $sessionId, string $track): Lead
    {
        return DB::transaction(function () use ($sessionId, $track) {
            $lead = Lead::create([
                'session_id' => $sessionId,
                'track' => $track,
                'stage' => 'visitor',
            ]);

            StageEvent::create([
                'lead_id' => $lead->id,
                'from_stage' => null,
                'to_stage' => 'visitor',
            ]);

            return $lead;
        });
    }
}
