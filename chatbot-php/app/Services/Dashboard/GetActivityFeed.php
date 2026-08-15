<?php

namespace App\Services\Dashboard;

use App\AuditLog;

// Ported from dashboard/logic/get-activity-feed.ts.
final class GetActivityFeed
{
    private const DEFAULT_LIMIT = 50;

    public function get(int $limit = self::DEFAULT_LIMIT)
    {
        return AuditLog::orderByDesc('created_at')->limit($limit)->get();
    }
}
