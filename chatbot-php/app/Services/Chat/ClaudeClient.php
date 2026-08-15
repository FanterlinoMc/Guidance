<?php

namespace App\Services\Chat;

use GuzzleHttp\Client;

final class ClaudeClient
{
    private const API_URL = 'https://api.anthropic.com/v1/messages';

    private const ANTHROPIC_VERSION = '2023-06-01';

    /** @var Client */
    private $httpClient;

    public function __construct(Client $httpClient)
    {
        $this->httpClient = $httpClient;
    }

    // NOTE: the TS original opens Anthropic's streaming endpoint and awaits stream.finalMessage()
    // -- it consumes the full stream server-side before returning, so the observable behavior is
    // already "block until the complete reply exists." Calling the plain (non-streaming) Messages
    // endpoint here produces the same result without needing an SSE parser on the PHP side. See
    // ChatController for why the complete reply must exist before the output guardrail runs.
    public function reply(string $systemMessage, array $history): string
    {
        $apiKey = config('services.anthropic.api_key');
        if (empty($apiKey)) {
            // Matches the TS original's getAnthropicApiKey() throwing before any network call --
            // fails fast into the generic 503 path (see ChatErrorResponder) instead of sending a
            // request that can only ever come back unauthorized.
            throw new \RuntimeException('Missing required environment variable: ANTHROPIC_API_KEY.');
        }

        $response = $this->httpClient->post(self::API_URL, [
            // A slow/unreachable network shouldn't hang a request indefinitely -- the original
            // has no such failure mode (Node's fetch has its own sane defaults), so this is a
            // deliberate addition rather than a straight port.
            'connect_timeout' => 5,
            'timeout' => 30,
            'headers' => [
                'x-api-key' => $apiKey,
                'anthropic-version' => self::ANTHROPIC_VERSION,
                'content-type' => 'application/json',
            ],
            'json' => [
                'model' => config('chat.claude_model'),
                'max_tokens' => config('chat.max_reply_tokens'),
                'system' => $systemMessage,
                'messages' => array_map(function (array $turn): array {
                    return ['role' => $turn['role'], 'content' => $turn['content']];
                }, $history),
            ],
        ]);

        $body = json_decode((string) $response->getBody(), true);

        $textBlocks = array_filter($body['content'] ?? [], function (array $block): bool {
            return $block['type'] === 'text';
        });

        return implode('', array_map(function (array $block): string {
            return $block['text'];
        }, $textBlocks));
    }
}
