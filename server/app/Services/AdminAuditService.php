<?php

namespace App\Services;

use App\Models\AdminAction;
use App\Models\User;

class AdminAuditService
{
    public function record(User $admin, string $actionType, string $targetType, int $targetId, ?string $reason = null): AdminAction
    {
        return AdminAction::query()->create([
            'admin_id' => $admin->id,
            'action_type' => $actionType,
            'target_type' => $targetType,
            'target_id' => $targetId,
            'reason' => $reason,
        ]);
    }
}
