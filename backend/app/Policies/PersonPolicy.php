<?php

namespace App\Policies;

use App\Models\Person;
use App\Models\User;

class PersonPolicy
{
    public function update(User $user, Person $person): bool
    {
        return $user->id === $person->user_id;
    }

    public function delete(User $user, Person $person): bool
    {
        return $this->update($user, $person);
    }
}
