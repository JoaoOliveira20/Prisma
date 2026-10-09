<?php

namespace App\Models\Concerns;

use Illuminate\Database\Eloquent\Builder;

trait OwnedByUser
{
    protected static function bootOwnedByUser(): void
    {
        static::addGlobalScope('owner', function (Builder $query) {
            if (auth()->check()) {
                $query->where($query->getModel()->getTable().'.user_id', auth()->id());
            }
        });
    }
}
