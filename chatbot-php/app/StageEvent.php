<?php

namespace App;

use App\Concerns\HasUuidPrimaryKey;
use Illuminate\Database\Eloquent\Model;

// Ported from lead-lifecycle/logic/types.ts's StageEvent -- append-only, no updated_at.
final class StageEvent extends Model
{
    use HasUuidPrimaryKey;

    protected $keyType = 'string';

    public $timestamps = false;

    protected $fillable = ['lead_id', 'from_stage', 'to_stage', 'detail'];

    // $timestamps = false means Eloquent won't auto-cast created_at to Carbon on its own --
    // without this it comes back from the DB as a plain string (found via AuditLog's identical
    // issue on the dashboard activity feed).
    protected $casts = ['detail' => 'array', 'created_at' => 'datetime'];

    protected static function booted()
    {
        static::creating(function (self $event) {
            if (! $event->created_at) {
                $event->created_at = now();
            }
        });
    }

    public function lead()
    {
        return $this->belongsTo(Lead::class);
    }
}
