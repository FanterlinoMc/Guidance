@extends('dashboard.layout')

@section('title', 'Overview — Guidance Internal Dashboard')

@section('content')
    <h1>Overview</h1>

    <div class="gh-dash-stats">
        <a href="{{ url('/dashboard/leads') }}" class="gh-dash-stat-card">
            <p class="gh-dash-stat-label">Total Leads</p>
            <p class="gh-dash-stat-value">{{ $stats['totalLeads'] }}</p>
        </a>
        <a href="{{ url('/dashboard/agents') }}" class="gh-dash-stat-card">
            <p class="gh-dash-stat-label">Agent Applications</p>
            <p class="gh-dash-stat-value">{{ $stats['totalAgentApplications'] }}</p>
        </a>
        <a href="{{ url('/dashboard/activity') }}" class="gh-dash-stat-card">
            <p class="gh-dash-stat-label">SLA Breaches (24h)</p>
            <p class="gh-dash-stat-value {{ $stats['slaBreachesLast24h'] > 0 ? 'gh-dash-stat-value--emphasize' : '' }}">{{ $stats['slaBreachesLast24h'] }}</p>
        </a>
    </div>

    <h2 class="gh-dash-section-title">Lead Funnel</h2>
    @php
        $maxStageCount = max(1, ...array_column($stats['stageCounts'], 'count'));
    @endphp
    <div class="gh-dash-funnel">
        @foreach ($stats['stageCounts'] as $stageCount)
            <div class="gh-dash-funnel-row">
                <span class="gh-dash-funnel-label">{{ str_replace('-', ' ', $stageCount['stage']) }}</span>
                <div class="gh-dash-funnel-track">
                    <div class="gh-dash-funnel-fill" style="width: {{ ($stageCount['count'] / $maxStageCount) * 100 }}%"></div>
                </div>
                <span class="gh-dash-funnel-count">{{ $stageCount['count'] }}</span>
            </div>
        @endforeach
    </div>

    <h2 class="gh-dash-section-title">Agent Pipeline</h2>
    @php
        $maxAgentCount = max(1, ...array_column($stats['agentStatusCounts'], 'count'));
    @endphp
    <div class="gh-dash-funnel">
        @foreach ($stats['agentStatusCounts'] as $statusCount)
            <div class="gh-dash-funnel-row">
                <span class="gh-dash-funnel-label">{{ $statusCount['status'] }}</span>
                <div class="gh-dash-funnel-track">
                    <div class="gh-dash-funnel-fill" style="width: {{ ($statusCount['count'] / $maxAgentCount) * 100 }}%"></div>
                </div>
                <span class="gh-dash-funnel-count">{{ $statusCount['count'] }}</span>
            </div>
        @endforeach
    </div>

    <h2 class="gh-dash-section-title">Recent Activity</h2>
    @if ($stats['recentActivity']->isEmpty())
        <div class="gh-dash-list">
            <p class="gh-dash-empty">No activity recorded yet.</p>
        </div>
    @else
        <ul class="gh-dash-list">
            @foreach ($stats['recentActivity'] as $event)
                <li class="gh-dash-list-item">
                    <div>
                        <p class="gh-dash-list-item-title">{{ ucwords(str_replace('_', ' ', strtolower($event->reason_code))) }}</p>
                        @if ($event->session_id)
                            <p class="gh-dash-list-item-meta">session {{ substr($event->session_id, 0, 8) }}</p>
                        @endif
                    </div>
                    <time class="gh-dash-list-item-time">{{ $event->created_at->diffForHumans() }}</time>
                </li>
            @endforeach
        </ul>
    @endif
@endsection
