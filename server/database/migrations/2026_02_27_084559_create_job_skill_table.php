<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateJobSkillTable extends Migration
{
    public function up()
    {
        Schema::create('job_skill', function (Blueprint $table) {
            $table->foreignId('job_id')->constrained('jobs')->cascadeOnDelete();
            $table->foreignId('skill_id')->constrained('skills')->cascadeOnDelete();
            $table->unsignedTinyInteger('importance')->nullable(); // 1-5 optional
            $table->timestamps();

            $table->primary(['job_id', 'skill_id']);
            $table->index('skill_id');
        });
    }

    public function down()
    {
        Schema::dropIfExists('job_skill');
    }
}