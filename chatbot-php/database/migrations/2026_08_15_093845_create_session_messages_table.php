<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('session_messages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('session_id');
            $table->enum('role', ['user', 'assistant']);
            $table->text('content');
            $table->timestamp('created_at')->useCurrent();

            $table->index(['session_id', 'created_at']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('session_messages');
    }
};
