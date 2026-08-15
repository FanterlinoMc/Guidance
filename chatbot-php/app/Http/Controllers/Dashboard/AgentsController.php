<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Services\Dashboard\GetAgentsView;

final class AgentsController extends Controller
{
    /** @var GetAgentsView */
    private $getAgentsView;

    public function __construct(GetAgentsView $getAgentsView)
    {
        $this->getAgentsView = $getAgentsView;
    }

    public function index()
    {
        return view('dashboard.agents.index', ['agents' => $this->getAgentsView->get()]);
    }
}
