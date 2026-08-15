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

    protected static function booted()
    {
        static::creating(function (self $message) {
            if (! $message->created_at) {
                $message->created_at = now();
            }
        });
    }
}
