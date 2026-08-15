<?php

namespace App\Services\Retrieval;

use App\Exceptions\AppException;
use App\Services\Audit\AuditLogger;

// The audited, server-side entry point for retrieval: enforces the anti-abuse query limit, then
// calls RetrieveContext at its default-deny visibility (public only) and logs every retrieval to
// the audit log. Visibility isn't elevated here because no staff/dashboard session exists yet to
// justify it -- the only real caller today is the public consumer widget.
final class RetrieveContextForSession
{
    /** @var KbQueryLimiter */
    private $kbQueryLimiter;

    /** @var RetrieveContext */
    private $retrieveContext;

    /** @var AuditLogger */
    private $auditLogger;

    public function __construct(KbQueryLimiter $kbQueryLimiter, RetrieveContext $retrieveContext, AuditLogger $auditLogger)
    {
        $this->kbQueryLimiter = $kbQueryLimiter;
        $this->retrieveContext = $retrieveContext;
        $this->auditLogger = $auditLogger;
    }

    /**
     * @param array{entity?: string, topK?: int} $options
     * @return array<int, array<string, mixed>>
     *
     * @throws AppException when the session has exceeded the KB query abuse limit
     */
    public function retrieve(string $sessionId, string $query, array $options = []): array
    {
        $limitResult = $this->kbQueryLimiter->check($sessionId, $query);
        if (! $limitResult['allowed']) {
            $this->auditLogger->logEvent('RETRIEVAL_ABUSE_BLOCKED', ['reason' => $limitResult['reason']], $sessionId);
            throw new AppException('RETRIEVAL_ABUSE_BLOCKED', 'Too many knowledge-base queries from this session.', 429);
        }

        $chunks = $this->retrieveContext->retrieve($query, $options);

        $chunkIds = array_map(function (array $chunk): string {
            return $chunk['id'];
        }, $chunks);

        $this->auditLogger->logEvent('RETRIEVAL_PERFORMED', [
            'visibility' => ['public'],
            'chunkIds' => $chunkIds,
            'queryHash' => $this->hashQuery($query),
        ], $sessionId);

        return $chunks;
    }

    // Audit logs record that a query happened without retaining the raw text (PII minimization)
    // -- a truncated SHA-256 is enough to correlate repeated or identical queries across a
    // session.
    private function hashQuery(string $query): string
    {
        $hash = hash('sha256', mb_strtolower(trim($query)));

        return substr($hash, 0, 16);
    }
}
