<?php

namespace App\Services\Cors;

final class CorsResolver
{
    private const ALLOWED_METHODS = 'POST, OPTIONS';

    private const ALLOWED_HEADERS = 'Content-Type';

    /**
     * Default-deny by construction: an empty allowlist means requestOrigin never matches, so no
     * Access-Control-Allow-Origin header is ever added and the browser's own same-origin policy
     * blocks cross-origin JS reads.
     *
     * @param string[] $allowedOrigins
     */
    public function resolveOrigin(?string $requestOrigin, array $allowedOrigins): ?string
    {
        if ($requestOrigin === null) {
            return null;
        }

        return in_array($requestOrigin, $allowedOrigins, true) ? $requestOrigin : null;
    }

    /**
     * @return array<string, string>
     */
    public function buildHeaders(?string $origin): array
    {
        if ($origin === null) {
            return [];
        }

        return [
            'Access-Control-Allow-Origin' => $origin,
            'Access-Control-Allow-Methods' => self::ALLOWED_METHODS,
            'Access-Control-Allow-Headers' => self::ALLOWED_HEADERS,
            // Required for the browser to send/accept the session cookie on cross-origin
            // requests -- safe alongside a reflected (never wildcard) origin above.
            'Access-Control-Allow-Credentials' => 'true',
            'Vary' => 'Origin',
        ];
    }

    /**
     * @return string[]
     */
    public function allowedOrigins(): array
    {
        $raw = config('cors_chat.allowed_origins', '');
        if ($raw === '') {
            return [];
        }

        return array_values(array_filter(array_map('trim', explode(',', $raw))));
    }
}
