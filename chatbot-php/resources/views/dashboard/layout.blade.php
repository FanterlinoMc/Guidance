<!DOCTYPE html>
{{--
    Shared dashboard shell. Layout contract: child views use `@extends('dashboard.layout')` +
    `@section('content') ... @endsection` (optionally `@section('title', 'Page Title')`, defaults
    to "Guidance Internal Dashboard" below). Active-nav-link highlighting is done via
    request()->is() path matching, not named routes, so it doesn't depend on what route names
    routes/web.php ends up using.

    Logout: posts to route('logout') -- the auth piece is expected to name its logout route
    exactly that (standard Laravel convention).
--}}
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('title', 'Guidance Internal Dashboard')</title>
    <link rel="stylesheet" href="{{ asset('dashboard-assets/dashboard.css') }}">
</head>
<body>
    <nav class="gh-dash-nav">
        <span class="gh-dash-nav-brand">Guidance Internal</span>
        <a href="{{ url('/dashboard') }}" class="gh-dash-nav-link {{ request()->is('dashboard') ? 'gh-dash-nav-link--active' : '' }}">Overview</a>
        <a href="{{ url('/dashboard/leads') }}" class="gh-dash-nav-link {{ request()->is('dashboard/leads*') ? 'gh-dash-nav-link--active' : '' }}">Leads</a>
        <a href="{{ url('/dashboard/agents') }}" class="gh-dash-nav-link {{ request()->is('dashboard/agents*') ? 'gh-dash-nav-link--active' : '' }}">Agents</a>
        <a href="{{ url('/dashboard/activity') }}" class="gh-dash-nav-link {{ request()->is('dashboard/activity*') ? 'gh-dash-nav-link--active' : '' }}">Activity</a>
        <span class="gh-dash-nav-spacer"></span>
        @if (Route::has('logout'))
            <form method="POST" action="{{ route('logout') }}">
                @csrf
                <button type="submit" class="gh-dash-nav-logout">Log out</button>
            </form>
        @endif
    </nav>

    <main class="gh-dash-content">
        @yield('content')
    </main>
</body>
</html>
