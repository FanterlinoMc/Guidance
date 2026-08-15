@extends('dashboard.layout')

@section('title', 'Activity')

@section('content')
    <h1 class="gh-dash-page-title">Activity Feed</h1>

    @if (count($events) === 0)
        <p class="gh-dash-empty">No activity recorded yet.</p>
    @else
        <ul class="gh-dash-activity-list">
            @foreach ($events as $event)
                <li class="gh-dash-activity-item">
                    <div class="gh-dash-activity-main">
                        <p class="gh-dash-activity-reason">
                            {{ ucwords(str_replace('_', ' ', strtolower($event->reason_code))) }}
                        </p>
                        @if ($event->session_id)
                            <p class="gh-dash-mono gh-dash-muted">session {{ substr($event->session_id, 0, 8) }}</p>
                        @endif
                        @if ($event->detail)
                            <pre class="gh-dash-detail">{{ json_encode($event->detail, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) }}</pre>
                        @endif
                    </div>
                    <time class="gh-dash-muted gh-dash-activity-time">{{ $event->created_at }}</time>
                </li>
            @endforeach
        </ul>
    @endif
@endsection
