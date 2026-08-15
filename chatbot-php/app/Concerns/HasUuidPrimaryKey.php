<?php

namespace App\Concerns;

use Illuminate\Support\Str;

// Every table in this schema uses a uuid primary key (matching the original Postgres schema's
// `default gen_random_uuid()`), not Laravel's default auto-incrementing integer id.
trait HasUuidPrimaryKey
{
    public static function bootHasUuidPrimaryKey()
    {
        static::creating(function ($model) {
            if (! $model->getKey()) {
                $model->{$model->getKeyName()} = (string) Str::uuid();
            }
        });
    }

    public function initializeHasUuidPrimaryKey()
    {
        $this->incrementing = false;
        $this->keyType = 'string';
    }
}
