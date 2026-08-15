<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('agent_records', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('lead_id');
            $table->string('license_number');
            $table->string('license_state');
            $table->boolean('is_part_time');
            // 0-10, set by a human reviewer during screening -- see AgentRecord's score field
            // comment for why no scoring formula is encoded here.
            $table->unsignedTinyInteger('score')->nullable();
            $table->string('status');
            $table->timestamps();

            $table->foreign('lead_id')->references('id')->on('leads')->onDelete('cascade');
            $table->index('lead_id');
        });
    }

    public function down()
    {
        Schema::dropIfExists('agent_records');
    }
};
