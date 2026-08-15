@extends('dashboard.layout')

@section('title', 'Leads')

@section('content')
    <style>
        .gh-dash-leads-table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 2px rgba(0,0,0,0.05); font-size: 14px; }
        .gh-dash-leads-table th { text-align: left; padding: 12px 20px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; color: rgba(0,0,0,0.5); border-bottom: 1px solid rgba(0,0,0,0.05); }
        .gh-dash-leads-table td { padding: 12px 20px; border-bottom: 1px solid rgba(0,0,0,0.05); color: rgba(0,0,0,0.75); }
        .gh-dash-leads-table tr:last-child td { border-bottom: none; }
        .gh-dash-leads-table a { color: #0b2545; font-weight: 500; text-decoration: none; }
        .gh-dash-leads-table a:hover { text-decoration: underline; }
        .gh-dash-badge { display: inline-block; padding: 2px 10px; border-radius: 9999px; font-size: 12px; font-weight: 500; text-transform: capitalize; }
        .gh-dash-badge--success { background: rgba(22,163,74,0.12); color: #15803d; }
        .gh-dash-badge--neutral { background: rgba(0,0,0,0.06); color: rgba(0,0,0,0.6); }
        .gh-dash-badge--progress { background: rgba(201,162,39,0.15); color: #92710f; }
        .gh-dash-empty { padding: 40px; text-align: center; color: rgba(0,0,0,0.5); font-size: 14px; background: #fff; border-radius: 8px; }
    </style>

    @if ($leads->isEmpty())
        <div class="gh-dash-empty">No leads yet &mdash; they'll appear here once a visitor starts a chat.</div>
    @else
        <div style="overflow-x: auto;">
            <table class="gh-dash-leads-table">
                <thead>
                    <tr>
                        <th>Contact</th>
                        <th>Track</th>
                        <th>Stage</th>
                        <th>City</th>
                        <th>Updated</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($leads as $lead)
                        <tr>
                            <td>
                                <a href="{{ url('/dashboard/leads/' . $lead->id) }}">
                                    {{ $lead->name ?? $lead->email ?? $lead->phone ?? 'Unidentified' }}
                                </a>
                            </td>
                            <td style="text-transform: capitalize;">{{ $lead->track }}</td>
                            <td>
                                @php
                                    $tone = in_array($lead->stage, ['closed', 'approved'], true) ? 'success'
                                        : (in_array($lead->stage, ['visitor', 'engaged'], true) ? 'neutral' : 'progress');
                                @endphp
                                <span class="gh-dash-badge gh-dash-badge--{{ $tone }}">{{ $lead->stage }}</span>
                            </td>
                            <td>{{ $lead->city ?? '—' }}</td>
                            <td style="font-size: 12px; color: rgba(0,0,0,0.5);">{{ $lead->updated_at }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    @endif
@endsection
