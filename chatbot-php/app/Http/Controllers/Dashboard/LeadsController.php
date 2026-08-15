<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Services\Dashboard\GetLeadDetail;
use App\Services\Dashboard\GetLeadsView;
use Illuminate\View\View;

final class LeadsController extends Controller
{
    /** @var GetLeadsView */
    private $getLeadsView;

    /** @var GetLeadDetail */
    private $getLeadDetail;

    public function __construct(GetLeadsView $getLeadsView, GetLeadDetail $getLeadDetail)
    {
        $this->getLeadsView = $getLeadsView;
        $this->getLeadDetail = $getLeadDetail;
    }

    public function index(): View
    {
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
