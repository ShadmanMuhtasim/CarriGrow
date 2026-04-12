<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AdminReport extends Model
{
    use HasFactory;

    public const TYPE_WEEKLY = 'weekly';
    public const TYPE_MONTHLY = 'monthly';
    public const TYPE_CUSTOM = 'custom';

    public const STATUS_READY = 'ready';
    public const STATUS_PROCESSING = 'processing';

    protected $fillable = [
        'title',
        'type',
        'status',
        'generated_by',
        'generated_at',
        'payload',
    ];

    protected $casts = [
        'generated_at' => 'datetime',
        'payload' => 'array',
    ];

    public function generator()
    {
        return $this->belongsTo(User::class, 'generated_by');
    }
}
