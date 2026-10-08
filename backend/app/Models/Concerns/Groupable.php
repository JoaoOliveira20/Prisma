<?php

namespace App\Models\Concerns;

use App\Models\GroupItem;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\MorphMany;

trait Groupable
{
    protected static function bootGroupable(): void
    {
        static::deleting(function ($model): void {
            $model->groupItems()->delete();
        });
    }

    public function groupItems(): MorphMany
    {
        return $this->morphMany(GroupItem::class, 'groupable');
    }

    public function scopeWithFavoriteFlag(Builder $query, User $user): void
    {
        $query->withExists(['groupItems as is_favorite' => fn ($items) => $items->whereHas(
            'group',
            fn ($group) => $group->where('user_id', $user->id)->where('is_favorites', true),
        )]);
    }

    public function loadFavoriteFlag(User $user): static
    {
        return $this->loadExists(['groupItems as is_favorite' => fn ($items) => $items->whereHas(
            'group',
            fn ($group) => $group->where('user_id', $user->id)->where('is_favorites', true),
        )]);
    }

    public function loadGroupIds(User $user): static
    {
        return $this->setAttribute('group_ids', $this->groupItems()
            ->whereHas('group', fn ($group) => $group->where('user_id', $user->id))
            ->pluck('group_id')
            ->all());
    }
}
