<?php

namespace App;

use App\Concerns\HasUuidPrimaryKey;
use Illuminate\Database\Eloquent\Model;

// Ported from agent-records/logic/types.ts's AgentRecord. No live-chat writer exists for this
// today (same as the TS original -- it's populated by a future onboarding process, this port
// only needs the model + status-transition rules to exist).
final class AgentRecord extends Model
{
    use HasUuidPrimaryKey;

    protected $keyType = 'string';

    protected $fillable = ['lead_id', 'license_number', 'license_state', 'is_part_time', 'score', 'status'];

    protected $casts = ['is_part_time' => 'boolean'];

    public function lead()
    {
        return $this->belongsTo(Lead::class);
    }
}
