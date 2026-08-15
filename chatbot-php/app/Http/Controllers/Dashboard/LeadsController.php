<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Services\Dashboard\GetLeadDetail;
use App\Services\Dashboard\GetLeadsView;
use App\Services\Routing\CheckLeadSlaBreaches;
use Illuminate\View\View;

final class LeadsController extends Controller
{
    /** @var GetLeadsView */
    private $getLeadsView;

    /** @var GetLeadDetail */
    private $getLeadDetail;

    /** @var CheckLeadSlaBreaches */
    private $checkLeadSlaBreaches;

    public function __construct(GetLeadsView $getLeadsView, GetLeadDetail $getLeadDetail, CheckLeadSlaBreaches $checkLeadSlaBreaches)
    {
        $this->getLeadsView = $getLeadsView;
        $this->getLeadDetail = $getLeadDetail;
        $this->checkLeadSlaBreaches = $checkLeadSlaBreaches;
    }

    public function index(): View
    {
        // A deliberate write on a page-load GET, not hidden inside GetLeadsView -- keeps the
        // view-fetcher itself read-only and puts the one write step somewhere a reader expects
        // it. No scheduler exists to drive this on a timer (same as the TS original), so "a
        // dashboard user visited the leads page" is the trigger instead.
        $this->checkLeadSlaBreaches->checkAll();

        return view('dashboard.leads.index', ['leads' => $this->getLeadsView->get()]);
    }

    public function show(string $id): View
    {
        $detail = $this->getLeadDetail->get($id);
        if ($detail === null) {
            abort(404);
        }

        return view('dashboard.leads.show', ['lead' => $detail['lead'], 'stageHistory' => $detail['stageHistory']]);
    }
}
