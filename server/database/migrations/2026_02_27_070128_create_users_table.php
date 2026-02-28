<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateUsersTable extends Migration
{
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->string('role')->default('job_seeker'); // job_seeker|employer|mentor|admin
            $table->string('status')->default('active');   // active|banned (optional but useful)
            $table->rememberToken();
            $table->timestamps();

            $table->index('role');
            $table->index('status');
        });
    }

    public function down()
    {
        Schema::dropIfExists('users');
    }
}