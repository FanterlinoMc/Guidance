@extends('dashboard.layout')

@section('title', 'Lead detail')

@section('content')
    <style>
        .gh-dash-card { background: #fff; border-radius: 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); padding: 20px; margin-bottom: 24px; }
        .gh-dash-card h2 { margin: 0; font-size: 18px; font-weight: 600; color: #0b2545; }
        .gh-dash-card h3 { margin: 0 0 12px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.04em; color: rgba(0,0,0,0.5); }
        .gh-dash-card-header { display: flex; align-items: center; justify-content: space-between; }
        .gh-dash-fields { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 16px; font-size: 14px; }
        .gh-dash-field dt { font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; color: rgba(0,0,0,0.4); margin: 0; }
        .gh-dash-field dd { margin: 2px 0 0; color: rgba(0,0,0,0.8); }
        .gh-dash-field dd.mono { font-family: monospace; font-size: 12px; }
        .gh-dash-badge { display: inline-block; padding: 2px 10px; border-radius: 9999px; font-size: 12px; font-weight: 500; text-transform: capitalize; }
        .gh-dash-badge--success { background: rgba(22,163,74,0.12); color: #15803d; }
        .gh-dash-badge--neutral { background: rgba(0,0,0,0.06); color: rgba(0,0,0,0.6); }
        .gh-dash-badge--progress { background: rgba(201,162,39,0.15); color: #92710f; }
        .gh-dash-history { list-style: none; margin: 0; padding: 0; }
        .gh-dash-history li { display: flex; align-items: center; gap: 12px; font-size: 14px; padding: 6px 0; }
        .gh-dash-history .transition { font-weight: 500; color: rgba(0,0,0,0.8); }
        .gh-dash-history .timestamp { font-size: 12px; color: rgba(0,0,0,0.5); }
    </style>

    @php
        $tone = in_array($lead->stage, ['closed', 'approved'], true) ? 'success'
            : (in_array($lead->stage, ['visitor', 'engaged'], true) ? 'neutral' : 'progress');
    @endphp

    <div class="gh-dash-card">
        <div class="gh-dash-card-header">
            <h2>{{ $lead->name ?? $lead->email ?? $lead->phone ?? 'Unidentified lead' }}</h2>
            <span class="gh-dash-badge gh-dash-badge--{{ $tone }}">{{ $lead->stage }}</span>
        </div>
        <dl class="gh-dash-fields">
            <div class="gh-dash-field"><dt>Track</dt><dd>{{ $lead->track }}</dd></div>
            <div class="gh-dash-field"><dt>Email</dt><dd>{{ $lead->email ?? '—' }}</dd></div>
            <div class="gh-dash-field"><dt>Phone</dt><dd>{{ $lead->phone ?? '—' }}</dd></div>
            <div class="gh-dash-field"><dt>City</dt><dd>{{ $lead->city ?? '—' }}</dd></div>
            <div class="gh-dash-field"><dt>Timeline</dt><dd>{{ $lead->timeline ?? '—' }}</dd></div>
            <div class="gh-dash-field"><dt>Session</dt><dd class="mono">{{ substr($lead->session_id, 0, 8) }}</dd></div>
        </dl>
    </div>

    <div class="gh-dash-card">
        <h3>Stage history</h3>
        <ol class="gh-dash-history">
            @foreach ($stageHistory as $event)
                <li>
                    <span class="transition">
                        @if ($event['fromStage'])
                            {{ $event['fromStage'] }} &rarr; {{ $event['toStage'] }}
                        @else
                            Started at {{ $event['toStage'] }}
                        @endif
                    </span>
                    <span class="timestamp">{{ $event['timestamp'] }}</span>
                </li>
            @endforeach
        </ol>
    </div>
@endsection
