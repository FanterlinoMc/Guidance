<?php

namespace App;

use App\Concerns\HasUuidPrimaryKey;
use Illuminate\Database\Eloquent\Model;

// Ported from session-transcript/logic/types.ts's SessionMessage -- append-only, no updated_at.
final class SessionMessage extends Model
{
    use HasUuidPrimaryKey;

    protected $keyType = 'string';

    public $timestamps = false;

    protected $fillable = ['session_id', 'role', 'content'];

    // $timestamps = false means Eloquent won't auto-cast created_at to Carbon on its own --
    // without this it comes back from the DB as a plain string (found via AuditLog's identical
    // issue on the dashboard activity feed).
    protected $casts = ['created_at' => 'datetime'];

    protected static function booted()
    {
        static::creating(function (self $message) {
            if (! $message->created_at) {
                $message->created_at = now();
            }
        });
    }
}
