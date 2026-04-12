<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmployerProfile extends Model
{
    protected $fillable = [
        'user_id',
        'company_name',
        'company_website',
        'company_logo_url',
        'company_description',
        'industry',
        'company_size',
        'founded_year',
        'headquarters_location',
        'contact_email',
        'contact_phone',
    ];

    protected $casts = [
        'founded_year' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
