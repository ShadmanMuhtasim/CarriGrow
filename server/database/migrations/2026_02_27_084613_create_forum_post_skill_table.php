<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateForumPostSkillTable extends Migration
{
    public function up()
    {
        Schema::create('forum_post_skill', function (Blueprint $table) {
            $table->foreignId('post_id')->constrained('forum_posts')->cascadeOnDelete();
            $table->foreignId('skill_id')->constrained('skills')->cascadeOnDelete();
            $table->timestamps();

            $table->primary(['post_id', 'skill_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('forum_post_skill');
    }
}