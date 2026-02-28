<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmployerProfile extends Model
{
    protected $fillable = ['user_id','company_name','company_website','company_description','company_location'];

    public function user() { return $this->belongsTo(User::class); }
}