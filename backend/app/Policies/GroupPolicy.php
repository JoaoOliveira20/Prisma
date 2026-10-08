<?php

namespace App\Policies;

use App\Models\Group;
use App\Models\User;

class GroupPolicy
{
    public function view(User $user, Group $group): bool
    {
        return $user->id === $group->user_id;
    }

    public function update(User $user, Group $group): bool
    {
        return $this->view($user, $group) && ! $group->is_favorites;
    }

    public function delete(User $user, Group $group): bool
    {
        return $this->update($user, $group);
    }
}
