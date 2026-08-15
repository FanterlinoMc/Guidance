<?php

namespace App\Services\Chat;

use App\Exceptions\AppException;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Throwable;

final class ChatErrorResponder
{
    // AppException (bad request, retrieval abuse, rate limited, ...) maps to its own status with
    // a safe message. Anything else -- including a missing ANTHROPIC_API_KEY -- is logged
    // server-side and returned as a generic 503 so internal detail never reaches the client; the
    // widget's own catch block already shows its own fallback text on any non-ok response.
    public function respond(Throwable $error): JsonResponse
    {
        if ($error instanceof AppException) {
            return response()->json(['error' => $error->errorCode, 'message' => $error->getMessage()], $error->status);
        }

        Log::error('[api/chat] ' . $error->getMessage(), ['exception' => $error]);

        return response()->json(
            ['error' => 'UPSTREAM_UNAVAILABLE', 'message' => 'The assistant is temporarily unavailable.'],
            503
        );
    }
}
