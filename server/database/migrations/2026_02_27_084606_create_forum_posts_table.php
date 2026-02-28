<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateForumPostsTable extends Migration
{
    public function up()
    {
        Schema::create('forum_posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->longText('content');
            $table->string('status')->default('active'); // active|hidden|deleted
            $table->timestamps();

            $table->index('status');
        });
    }

    public function down()
    {
        Schema::dropIfExists('forum_posts');
    }
}