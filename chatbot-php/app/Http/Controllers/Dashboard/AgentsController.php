<?php

namespace App\Http\Controllers\Dashboard;

use App\AgentRecord;
use App\Http\Controllers\Controller;
use App\Services\Dashboard\GetAgentsView;
use App\Services\Routing\RecordRoutingOverride;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;

final class AgentsController extends Controller
{
    /** @var GetAgentsView */
    private $getAgentsView;

    /** @var RecordRoutingOverride */
    private $recordRoutingOverride;

    public function __construct(GetAgentsView $getAgentsView, RecordRoutingOverride $recordRoutingOverride)
    {
        $this->getAgentsView = $getAgentsView;
        $this->recordRoutingOverride = $recordRoutingOverride;
    }

    public function index(): View
    {
        return view('dashboard.agents.index', ['agents' => $this->getAgentsView->get()]);
    }

    // Ported behavior only records the override for audit purposes -- it does not change the
    // agent record's status. The original codebase has no defined state transition for "a DM
    // manually approved a sub-7 application" (status-transitions.ts owns real status changes,
    // this is a separate audit trail alongside it), so this doesn't invent one.
    public function override(Request $request, string $id): RedirectResponse
    {
        $agent = AgentRecord::findOrFail($id);

        $validated = $request->validate([
            'reason' => ['required', 'string', 'max:1000'],
        ]);

        $this->recordRoutingOverride->record($agent->lead_id, Auth::user()->role, $validated['reason']);

        return redirect()->route('dashboard.agents.index')->with('status', 'Override recorded.');
    }
}
