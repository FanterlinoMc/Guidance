<?php

namespace App;

use App\Concerns\HasUuidPrimaryKey;
use Illuminate\Database\Eloquent\Model;

// Ported from lead-lifecycle/logic/types.ts's Lead, with lead-extraction's ExtractedLeadFields
// (email/phone/name/city/timeline) folded on as nullable columns -- see the leads migration's
// comment for why there's no separate "captured fields" table.
final class Lead extends Model
{
    use HasUuidPrimaryKey;

    protected $keyType = 'string';

    protected $fillable = ['session_id', 'track', 'stage', 'email', 'phone', 'name', 'city', 'timeline'];

    public function stageEvents()
    {
        return $this->hasMany(StageEvent::class);
    }

    public function hasContactInfo(): bool
    {
        return $this->email !== null || $this->phone !== null;
    }
}
