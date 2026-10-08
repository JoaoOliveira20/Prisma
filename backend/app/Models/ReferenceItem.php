<?php

namespace App\Models;

use App\Models\Concerns\Groupable;
use App\Models\Concerns\Searchable;
use Closure;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphToMany;
use Illuminate\Support\Facades\Storage;

#[Fillable(['title', 'image_url', 'image_path', 'source_url', 'credit', 'description'])]
class ReferenceItem extends Model
{
    use Groupable, Searchable;

    protected static function booted(): void
    {
        static::deleted(function (ReferenceItem $reference) {
            if ($reference->image_path) {
                Storage::disk('public')->delete($reference->image_path);
            }
        });
    }

    public function scopeWithUserState(Builder $query, User $user): void
    {
        $query
            ->with(['styles', 'people', 'strategies', 'groupItems' => static::userGroupItems($user)])
            ->withFavoriteFlag($user);
    }

    public function loadUserState(User $user): static
    {
        return $this
            ->load(['styles', 'people', 'strategies', 'groupItems' => static::userGroupItems($user)])
            ->loadFavoriteFlag($user);
    }

    private static function userGroupItems(User $user): Closure
    {
        return fn ($items) => $items->whereHas('group', fn ($group) => $group->where('user_id', $user->id));
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function styles(): MorphToMany
    {
        return $this->morphedByMany(Style::class, 'referenceable');
    }

    public function people(): MorphToMany
    {
        return $this->morphedByMany(Person::class, 'referenceable');
    }

    public function strategies(): MorphToMany
    {
        return $this->morphedByMany(Strategy::class, 'referenceable');
    }

    public function displayUrl(): string
    {
        return $this->image_path ? Storage::disk('public')->url($this->image_path) : $this->image_url;
    }
}
