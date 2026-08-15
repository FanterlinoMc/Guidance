<?php

namespace App\Services\Chat;

use App\Exceptions\AppException;

final class ChatRequestParser
{
    /**
     * Validates the client's { messages } body against the widget's ChatMessage[] shape
     * (id/role/content) -- id is dropped since the model call only needs role/content.
     * sessionId is deliberately NOT read from the body: it's server-resolved from an HttpOnly
     * cookie so a client can't forge or copy another visitor's session identity.
     *
     * @param mixed $body
     * @return array{messages: array<int, array{role: string, content: string}>}
     */
    public function parse($body): array
    {
        if (! is_array($body)) {
            throw new AppException('INVALID_REQUEST', 'Request body must be a JSON object.', 400);
        }

        $messages = $body['messages'] ?? null;
        if (! is_array($messages) || count($messages) === 0) {
            throw new AppException('INVALID_REQUEST', 'messages must be a non-empty array.', 400);
        }

        $turns = array_map(function ($entry): array {
            return $this->toChatTurn($entry);
        }, $messages);

        if ($turns[count($turns) - 1]['role'] !== 'user') {
            throw new AppException('INVALID_REQUEST', 'The last message must be from the user.', 400);
        }

        return ['messages' => $turns];
    }

    /**
     * @param mixed $entry
     * @return array{role: string, content: string}
     */
    private function toChatTurn($entry): array
    {
        if (! is_array($entry)) {
            throw new AppException('INVALID_REQUEST', 'Each message must be an object.', 400);
        }

        $role = $entry['role'] ?? null;
        $content = $entry['content'] ?? null;

        if ($role !== 'user' && $role !== 'assistant') {
            throw new AppException('INVALID_REQUEST', 'Invalid message role: ' . var_export($role, true) . '.', 400);
        }
        if (! is_string($content) || $content === '') {
            throw new AppException('INVALID_REQUEST', 'Message content must be a non-empty string.', 400);
        }

        return ['role' => $role, 'content' => $content];
    }
}
