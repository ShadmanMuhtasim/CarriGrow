<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateJobsTable extends Migration
{
    public function up()
    {
        Schema::create('jobs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employer_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->longText('description');
            $table->string('location')->nullable();
            $table->string('job_type')->default('full_time'); // full_time|part_time|intern|remote etc.
            $table->string('salary_range')->nullable();
            $table->date('deadline')->nullable();
            $table->string('status')->default('open'); // open|closed
            $table->timestamps();

            $table->index('employer_id');
            $table->index('status');
        });
    }

    public function down()
    {
        Schema::dropIfExists('jobs');
    }
}