<?php

namespace App\Services\Dashboard;

use App\Lead;
use Illuminate\Database\Eloquent\Collection;

// Ported from dashboard/logic/get-leads-view.ts. The TS original merges in a separate
// captured-fields store -- redundant here since Phase 3 already folded those fields
// (email/phone/name/city/timeline) directly onto the leads table.
final class GetLeadsView
{
    public function get(): Collection
    {
        return Lead::orderByDesc('updated_at')->get();
    }
}
