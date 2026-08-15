<?php

namespace App\Services\Leads;

use App\Lead;

// Orchestrates find-or-create-lead + captureLeadFields for one chat turn -- kept separate from
// ChatController so the controller only gains one dependency, not three.
//
// DECISION (2026-08-15, user-confirmed): the original app never actually called createLead()
// from the live chat route at all -- determining a lead's track (homebuyer vs. agent) needs
// audience detection that only exists inside the LLM's own reasoning, never server-side. Every
// new lead is defaulted to track=homebuyer (the majority case per the system prompt's framing)
// so this can ship today; a real REA visitor is misclassified until server-side audience
// detection exists. Flagged here deliberately -- this is new behavior, not a straight port.
final class CaptureLeadFromChatTurn
{
    private const DEFAULT_TRACK = 'homebuyer';

    /** @var CreateLead */
    private $createLead;

    /** @var CaptureLeadFields */
    private $captureLeadFields;

    public function __construct(CreateLead $createLead, CaptureLeadFields $captureLeadFields)
    {
        $this->createLead = $createLead;
        $this->captureLeadFields = $captureLeadFields;
    }

    public function handle(string $sessionId, string $message): void
    {
        $lead = Lead::where('session_id', $sessionId)->first();
        if ($lead === null) {
            $lead = $this->createLead->create($sessionId, self::DEFAULT_TRACK);
        }

        $this->captureLeadFields->capture($lead->id, $message);
    }
}
