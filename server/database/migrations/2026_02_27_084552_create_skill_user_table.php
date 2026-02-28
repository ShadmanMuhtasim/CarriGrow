<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateSkillUserTable extends Migration
{
    public function up()
    {
        Schema::create('skill_user', function (Blueprint $table) {
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('skill_id')->constrained('skills')->cascadeOnDelete();
            $table->unsignedTinyInteger('level')->nullable(); // 1-5 optional
            $table->timestamps();

            $table->primary(['user_id', 'skill_id']);
            $table->index('skill_id');
        });
    }

    public function down()
    {
        Schema::dropIfExists('skill_user');
    }
}