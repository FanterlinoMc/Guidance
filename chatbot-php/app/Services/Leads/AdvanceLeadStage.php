<?php

namespace App\Services\Leads;

use App\Exceptions\AppException;
use App\Lead;
use App\StageEvent;
use Illuminate\Support\Facades\DB;

final class AdvanceLeadStage
{
    /** @var StageTransitions */
    private $stageTransitions;

    public function __construct(StageTransitions $stageTransitions)
    {
        $this->stageTransitions = $stageTransitions;
    }

    public function advance(string $leadId, string $toStage, ?array $detail = null): Lead
    {
        $lead = Lead::find($leadId);
        if ($lead === null) {
            throw new AppException('INVALID_REQUEST', "No lead found for id {$leadId}.", 404);
        }

        if (! $this->stageTransitions->isValidTransition($lead->stage, $toStage)) {
            throw new AppException(
                'INVALID_REQUEST',
                "Cannot move lead {$leadId} from \"{$lead->stage}\" to \"{$toStage}\" -- stages only advance forward.",
                400
            );
        }

        return DB::transaction(function () use ($lead, $toStage, $detail) {
            $fromStage = $lead->stage;
            $lead->stage = $toStage;
            $lead->save();

            StageEvent::create([
                'lead_id' => $lead->id,
                'from_stage' => $fromStage,
                'to_stage' => $toStage,
                'detail' => $detail,
            ]);

            return $lead;
        });
    }
}
