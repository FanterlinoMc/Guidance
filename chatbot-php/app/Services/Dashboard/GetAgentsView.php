<?php

namespace App\Services\Dashboard;

use App\AgentRecord;
use App\Services\Routing\RequiresVeto;

// Ported from dashboard/logic/get-agents-view.ts.
final class GetAgentsView
{
    /** @var RequiresVeto */
    private $requiresVeto;

    public function __construct(RequiresVeto $requiresVeto)
    {
        $this->requiresVeto = $requiresVeto;
    }

    /**
     * @return array<int, array{record: AgentRecord, needsVeto: bool}>
     */
    public function get(): array
    {
        $records = AgentRecord::orderByDesc('updated_at')->get();

        $rows = [];
        foreach ($records as $record) {
            $rows[] = ['record' => $record, 'needsVeto' => $this->requiresVeto->requiresVeto($record)];
        }

        return $rows;
    }
}
