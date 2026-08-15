<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Guidance Internal &mdash; Sign in</title>
    <link rel="stylesheet" href="{{ asset('dashboard-assets/auth.css') }}">
</head>
<body>
    <div class="gh-auth-card">
        <p class="gh-auth-title">Guidance Internal</p>
        <p class="gh-auth-subtitle">Sign in to the internal dashboard</p>

        @if ($errors->any())
            <div class="gh-auth-error">{{ $errors->first() }}</div>
        @endif

        <form method="POST" action="{{ route('login.attempt') }}" class="gh-auth-form">
            @csrf
            <label class="gh-auth-label" for="email">Email</label>
            <input class="gh-auth-input" type="email" id="email" name="email" value="{{ old('email') }}" required autofocus>

            <label class="gh-auth-label" for="password">Password</label>
            <input class="gh-auth-input" type="password" id="password" name="password" required>

            <label class="gh-auth-remember">
                <input type="checkbox" name="remember"> Remember me
            </label>

            <button type="submit" class="gh-auth-submit">Sign in</button>
        </form>
    </div>
</body>
</html>
