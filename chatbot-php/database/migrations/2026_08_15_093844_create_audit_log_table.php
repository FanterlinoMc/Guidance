<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // reason_code is deliberately not constrained against a fixed enum -- that list has
        // grown several times already as guardrails/retrieval/routing features were added, and
        // a stale constraint would reject valid new codes at the DB layer before anyone
        // remembers to migrate it.
        Schema::create('audit_log', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('session_id')->nullable();
            $table->string('reason_code');
            $table->json('detail')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index('session_id');
            $table->index('reason_code');
        });
    }

    public function down()
    {
        Schema::dropIfExists('audit_log');
    }
};
