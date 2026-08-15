<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('stage_events', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('lead_id');
            $table->string('from_stage')->nullable();
            $table->string('to_stage');
            $table->json('detail')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('lead_id')->references('id')->on('leads')->onDelete('cascade');
            $table->index('lead_id');
        });
    }

    public function down()
    {
        Schema::dropIfExists('stage_events');
    }
};
