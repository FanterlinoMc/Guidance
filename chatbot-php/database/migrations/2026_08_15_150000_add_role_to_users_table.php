<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // Ported from src/features/dashboard-auth/logic/roles.ts's DashboardRole union
        // (concierge, ae, rm, dm, admin). Deliberately not CHECK-constrained -- same reasoning
        // as audit_log.reason_code in Phase 3, this list could grow and a stale constraint would
        // reject a valid new role at the DB layer. No permission matrix exists yet either (see
        // roles.ts's own comment), so EnsureDashboardRole only checks "has any role", not which.
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->nullable()->after('password');
        });
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('role');
        });
    }
};
