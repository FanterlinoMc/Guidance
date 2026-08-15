@extends('dashboard.layout')

@section('title', 'Agents')

@section('content')
    <h1 class="gh-dash-page-title">Agent Applications</h1>

    @if (count($agents) === 0)
        <p class="gh-dash-empty">No agent applications yet — REA signups will appear here.</p>
    @else
        <div class="gh-dash-table-wrap">
            <table class="gh-dash-table">
                <thead>
                    <tr>
                        <th>License</th>
                        <th>State</th>
                        <th>Part-time</th>
                        <th>Score</th>
                        <th>Status</th>
                        <th>Updated</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($agents as $row)
                        @php $agent = $row['record']; @endphp
                        <tr>
                            <td class="gh-dash-mono">{{ $agent->license_number }}</td>
                            <td>{{ $agent->license_state }}</td>
                            <td>{{ $agent->is_part_time ? 'Yes' : 'No' }}</td>
                            <td>
                                {{ $agent->score ?? '—' }}
                                @if ($row['needsVeto'])
                                    <span class="gh-dash-badge gh-dash-badge--warning">Needs review</span>
                                @endif
                            </td>
                            <td>
                                @php
                                    $tone = 'progress';
                                    if (in_array($agent->status, ['onboarded', 'approved'], true)) $tone = 'success';
                                    elseif ($agent->status === 'rejected') $tone = 'danger';
                                    elseif ($agent->status === 'applied') $tone = 'neutral';
                                @endphp
                                <span class="gh-dash-badge gh-dash-badge--{{ $tone }}">{{ $agent->status }}</span>
                            </td>
                            <td class="gh-dash-muted">{{ $agent->updated_at }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    @endif
@endsection
