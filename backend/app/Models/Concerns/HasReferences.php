<?php

namespace App\Models\Concerns;

use App\Models\ReferenceItem;
use Illuminate\Database\Eloquent\Relations\MorphToMany;

trait HasReferences
{
    protected static function bootHasReferences(): void
    {
        static::deleting(function ($model): void {
            $model->references()->detach();
        });
    }

    public function references(): MorphToMany
    {
        return $this->morphToMany(ReferenceItem::class, 'referenceable')->latest('reference_items.id');
    }
}
