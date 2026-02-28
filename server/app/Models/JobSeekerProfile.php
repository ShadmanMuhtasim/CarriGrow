<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JobSeekerProfile extends Model
{
    protected $fillable = ['user_id','bio','education','experience','portfolio_url','linkedin_url'];

    public function user() { return $this->belongsTo(User::class); }
}