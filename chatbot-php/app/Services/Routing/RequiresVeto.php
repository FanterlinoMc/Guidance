<?php

namespace App\Services\Routing;

use App\AgentRecord;

final class RequiresVeto
{
    // Score < 7 requires a human veto/override before a REA application can advance. An
    // unscored applicant (score not yet set during screening) is not auto-vetoed -- there's
    // simply no score to compare yet.
    private const VETO_SCORE_THRESHOLD = 7;

    public function requiresVeto(AgentRecord $agentRecord): bool
    {
        return $agentRecord->score !== null && $agentRecord->score < self::VETO_SCORE_THRESHOLD;
    }
}
