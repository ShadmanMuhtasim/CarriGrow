<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MentorProfile extends Model
{
    protected $fillable = [
        'user_id',
        'current_position',
        'company',
        'years_of_experience',
        'expertise_areas',
        'bio',
        'linkedin_url',
        'calendly_link',
        'availability',
        'mentorship_areas',
        'hourly_rate',
    ];

    protected $casts = [
        'years_of_experience' => 'integer',
        'hourly_rate' => 'float',
        'expertise_areas' => 'array',
        'availability' => 'array',
        'mentorship_areas' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
