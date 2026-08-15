<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // NOTE: LeadStage/LeadTrack are PROVISIONAL, ported as-is from the TS original's own
        // "reconstructed pending vault reconciliation" caveat -- update the enum lists here in
        // lockstep if that union changes upstream. lead-extraction's contact fields
        // (email/phone/name/city/timeline) are folded in as nullable columns rather than a
        // separate table -- there's no independent lifecycle for a "contact fields" entity, they
        // just get merged onto the same lead record.
        Schema::create('leads', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('session_id');
            $table->enum('track', ['homebuyer', 'agent']);
            $table->enum('stage', [
                'visitor', 'engaged', 'qualified', 'captured', 'ae-assigned',
                'contacted', 'application-started', 'application-in-review', 'approved', 'closed',
            ]);
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('name')->nullable();
            $table->string('city')->nullable();
            $table->string('timeline')->nullable();
            $table->timestamps();

            $table->index('session_id');
            // Not unique: captureLeadFields() dedupes by email at the application layer and
            // flags collisions rather than rejecting them, so a DB-level unique constraint would
            // fight it -- matches the original Postgres schema's own comment.
            $table->index('email');
        });
    }

    public function down()
    {
        Schema::dropIfExists('leads');
    }
};
