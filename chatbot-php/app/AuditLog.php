<?php

namespace App;

use App\Concerns\HasUuidPrimaryKey;
use Illuminate\Database\Eloquent\Model;

// Ported from audit-log/logic/log-event.ts's AuditEvent -- append-only, no updated_at.
final class AuditLog extends Model
{
    use HasUuidPrimaryKey;

    protected $table = 'audit_log';

    protected $keyType = 'string';

    public $timestamps = false;

    protected $fillable = ['session_id', 'reason_code', 'detail'];

    // $timestamps = false means Eloquent won't auto-cast created_at to Carbon on its own --
    // without this it comes back from the DB as a plain string and breaks any caller doing
    // ->diffForHumans() etc. (found via the dashboard activity feed).
    protected $casts = ['detail' => 'array', 'created_at' => 'datetime'];

    protected static function booted()
    {
        static::creating(function (self $event) {
            if (! $event->created_at) {
                $event->created_at = now();
            }
        });
    }
}
