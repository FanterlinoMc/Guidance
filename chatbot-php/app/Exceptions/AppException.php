<?php

namespace App\Exceptions;

use Exception;

// Ported from the TS original's AppError -- a typed application error carrying an HTTP status
// and a machine-readable code, distinct from an unexpected/internal exception. ChatController
// maps this to { error: code, message } at the given status; anything else becomes a generic
// 503 so internal detail never reaches the client.
final class AppException extends Exception
{
    // Named errorCode/status rather than reusing Exception's built-in $code (int) and no
    // built-in status property, to avoid ambiguity with the parent class's own int $code.
    /** @var string */
    public $errorCode;

    /** @var int */
    public $status;

    public function __construct(string $errorCode, string $message, int $status)
    {
        parent::__construct($message);
        $this->errorCode = $errorCode;
        $this->status = $status;
    }
}
