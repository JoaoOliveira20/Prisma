<?php

namespace App\Policies;

use App\Models\Style;
use App\Models\User;

class StylePolicy
{
    public function update(User $user, Style $style): bool
    {
        return $user->id === $style->user_id;
    }

    public function delete(User $user, Style $style): bool
    {
        return $this->update($user, $style);
    }
}
