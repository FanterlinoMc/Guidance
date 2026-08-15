<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Guidance Home Services</title>
    <link rel="stylesheet" href="{{ asset('chat-widget/chat-widget.css') }}">
    <style>
        body {
            display: flex;
            min-height: 100vh;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 32px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        h1 { color: #0b2545; font-size: 24px; font-weight: 600; margin: 0; }
        p { margin: 8px 0 0; font-size: 14px; color: rgba(0, 0, 0, 0.7); }
    </style>
</head>
<body>
    <h1>Guidance Home Services</h1>
    <p>Chat with our AI assistant below.</p>

    {{-- Widget embed: jQuery, then the widget files in dependency order, no build step. --}}
    <script src="https://code.jquery.com/jquery-3.2.1.min.js"></script>
    <script src="{{ asset('chat-widget/session-storage.js') }}"></script>
    <script src="{{ asset('chat-widget/sse-parser.js') }}"></script>
    <script src="{{ asset('chat-widget/multilingual.js') }}"></script>
    <script src="{{ asset('chat-widget/render-markdown.js') }}"></script>
    <script src="{{ asset('chat-widget/typing-indicator.js') }}"></script>
    <script src="{{ asset('chat-widget/quick-replies.js') }}"></script>
    <script src="{{ asset('chat-widget/chat-input.js') }}"></script>
    <script src="{{ asset('chat-widget/message-list.js') }}"></script>
    <script src="{{ asset('chat-widget/chat-session.js') }}"></script>
    <script src="{{ asset('chat-widget/chat-widget.js') }}"></script>
</body>
</html>
