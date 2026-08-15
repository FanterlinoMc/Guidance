<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Services\Dashboard\GetOverviewStats;
use Illuminate\View\View;

final class DashboardController extends Controller
{
    /** @var GetOverviewStats */
    private $getOverviewStats;

    public function __construct(GetOverviewStats $getOverviewStats)
    {
        $this->getOverviewStats = $getOverviewStats;
    }

    public function index(): View
    {
        return view('dashboard.overview', ['stats' => $this->getOverviewStats->get()]);
    }
}
