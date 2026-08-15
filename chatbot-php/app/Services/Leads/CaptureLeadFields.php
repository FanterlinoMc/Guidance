<?php

namespace App\Services\Leads;

use App\Lead;

final class CaptureLeadFields
{
    /** @var LeadFieldExtractor */
    private $extractor;

    /** @var AdvanceLeadStage */
    private $advanceLeadStage;

    public function __construct(LeadFieldExtractor $extractor, AdvanceLeadStage $advanceLeadStage)
    {
        $this->extractor = $extractor;
        $this->advanceLeadStage = $advanceLeadStage;
    }

    /**
     * Extracts contact fields from a message, merges them onto the lead's own row (Phase 3
     * folds captured fields directly onto `leads` rather than a separate JSONL store -- see the
     * leads migration's comment), flags an email already tied to a different lead, and advances
     * the lead to "captured" the first time either email or phone lands.
     *
     * @return array{fields: array, isDuplicateEmail: bool, duplicateOfLeadId: string|null}
     */
    public function capture(string $leadId, string $message): array
    {
        $lead = Lead::find($leadId);
        $newFields = $this->extractor->extract($message);
        $hadContactInfo = $lead !== null && $lead->hasContactInfo();

        $duplicateOfLeadId = null;
        $isDuplicateEmail = false;
        if (isset($newFields['email'])) {
            $duplicate = Lead::where('email', $newFields['email'])->where('id', '!=', $leadId)->first();
            if ($duplicate !== null) {
                $duplicateOfLeadId = $duplicate->id;
                $isDuplicateEmail = true;
            }
        }

        if ($lead !== null) {
            $lead->fill($newFields);
            $lead->save();
        }

        $hasContactInfoNow = $lead !== null && $lead->hasContactInfo();
        if (! $hadContactInfo && $hasContactInfoNow) {
            $this->advanceLeadStage->advance($leadId, 'captured');
        }

        return [
            'fields' => $lead !== null
                ? ['email' => $lead->email, 'phone' => $lead->phone, 'name' => $lead->name, 'city' => $lead->city, 'timeline' => $lead->timeline]
                : $newFields,
            'isDuplicateEmail' => $isDuplicateEmail,
            'duplicateOfLeadId' => $duplicateOfLeadId,
        ];
    }
}
