<?php

namespace App\Policies;

use App\Models\ReferenceItem;
use App\Models\User;

class ReferenceItemPolicy
{
    public function update(User $user, ReferenceItem $referenceItem): bool
    {
        return $user->id === $referenceItem->user_id;
    }

    public function delete(User $user, ReferenceItem $referenceItem): bool
    {
        return $user->id === $referenceItem->user_id;
    }
}
