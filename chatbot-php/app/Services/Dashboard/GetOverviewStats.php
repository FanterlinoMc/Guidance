<?php

namespace App\Services\Dashboard;

use App\AgentRecord;
use App\AuditLog;
use App\Lead;
use App\Services\Leads\StageTransitions;
use Carbon\Carbon;

// Ported from dashboard/logic/get-overview-stats.ts's getOverviewStats().
final class GetOverviewStats
{
    private const RECENT_ACTIVITY_LIMIT = 10;

    private const SLA_BREACH_WINDOW_HOURS = 24;

    // Display order only -- StageTransitions/status-transition rules own the actual funnel/
    // transition logic, this just controls the order stats render in.
    private const AGENT_STATUS_DISPLAY_ORDER = ['applied', 'screening', 'approved', 'onboarded', 'rejected'];

    /**
     * @return array{totalLeads: int, stageCounts: array, totalAgentApplications: int, agentStatusCounts: array, slaBreachesLast24h: int, recentActivity: \Illuminate\Support\Collection}
     */
    public function get(): array
    {
        $stageCounts = [];
        foreach (StageTransitions::STAGES as $stage) {
            $stageCounts[] = ['stage' => $stage, 'count' => Lead::where('stage', $stage)->count()];
        }

        $agentStatusCounts = [];
        foreach (self::AGENT_STATUS_DISPLAY_ORDER as $status) {
            $agentStatusCounts[] = ['status' => $status, 'count' => AgentRecord::where('status', $status)->count()];
        }

        $breachWindowStart = Carbon::now()->subHours(self::SLA_BREACH_WINDOW_HOURS);

        return [
            'totalLeads' => Lead::count(),
            'stageCounts' => $stageCounts,
            'totalAgentApplications' => AgentRecord::count(),
            'agentStatusCounts' => $agentStatusCounts,
            'slaBreachesLast24h' => AuditLog::where('reason_code', 'SLA_BREACHED')
                ->where('created_at', '>=', $breachWindowStart)
                ->count(),
            'recentActivity' => AuditLog::orderByDesc('created_at')->limit(self::RECENT_ACTIVITY_LIMIT)->get(),
        ];
    }
}
