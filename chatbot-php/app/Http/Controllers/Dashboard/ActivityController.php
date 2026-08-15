<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Services\Dashboard\GetActivityFeed;

final class ActivityController extends Controller
{
    /** @var GetActivityFeed */
    private $getActivityFeed;

    public function __construct(GetActivityFeed $getActivityFeed)
    {
        $this->getActivityFeed = $getActivityFeed;
    }

    public function index()
    {
        return view('dashboard.activity.index', ['events' => $this->getActivityFeed->get()]);
    }
}
