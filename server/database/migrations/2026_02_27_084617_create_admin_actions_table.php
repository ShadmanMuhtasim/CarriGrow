<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAdminActionsTable extends Migration
{
    public function up()
    {
        Schema::create('admin_actions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('admin_id')->constrained('users')->cascadeOnDelete();
            $table->string('action_type');  // ban_user, hide_post, delete_post, etc.
            $table->string('target_type');  // user, forum_post, forum_reply, job
            $table->unsignedBigInteger('target_id');
            $table->text('reason')->nullable();
            $table->timestamps();

            $table->index(['target_type', 'target_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('admin_actions');
    }
}