<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateJobApplicationsTable extends Migration
{
    public function up()
    {
        Schema::create('job_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_id')->constrained('jobs')->cascadeOnDelete();
            $table->foreignId('job_seeker_id')->constrained('users')->cascadeOnDelete();
            $table->text('cover_letter')->nullable();
            $table->string('cv_url')->nullable();
            $table->string('status')->default('applied'); // applied|reviewed|shortlisted|rejected
            $table->timestamp('applied_at')->useCurrent();
            $table->timestamps();

            $table->unique(['job_id', 'job_seeker_id']);
            $table->index('status');
        });
    }

    public function down()
    {
        Schema::dropIfExists('job_applications');
    }
}