<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateJobSeekerProfilesTable extends Migration
{
    public function up()
    {
        Schema::create('job_seeker_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->text('bio')->nullable();
            $table->text('education')->nullable();
            $table->text('experience')->nullable();
            $table->string('portfolio_url')->nullable();
            $table->string('linkedin_url')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('job_seeker_profiles');
    }
}