<?php

namespace App\Models;

use App\Models\Concerns\HasUniqueSlug;
use App\Models\Concerns\OwnedByUser;
use App\Models\Concerns\Searchable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

#[Fillable(['name'])]
class Tag extends Model
{
    use HasUniqueSlug, OwnedByUser, Searchable;

    public function styles(): BelongsToMany
    {
        return $this->belongsToMany(Style::class);
    }

    public function people(): BelongsToMany
    {
        return $this->belongsToMany(Person::class);
    }

    public function strategies(): BelongsToMany
    {
        return $this->belongsToMany(Strategy::class);
    }

    public function referenceItems(): BelongsToMany
    {
        return $this->belongsToMany(ReferenceItem::class);
    }

    public function isInUse(): bool
    {
        return $this->referenceItems()->exists()
            || $this->styles()->exists() || $this->people()->exists() || $this->strategies()->exists();
    }
}
