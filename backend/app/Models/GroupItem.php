<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\Relations\Relation;

#[Fillable(['groupable_type', 'groupable_id'])]
class GroupItem extends Model
{
    public function group(): BelongsTo
    {
        return $this->belongsTo(Group::class);
    }

    public function groupable(): MorphTo
    {
        return $this->morphTo();
    }

    public static function resolveGroupable(string $type, string $slug): Model
    {
        $class = Relation::getMorphedModel($type);

        abort_if($class === null, 404);

        return $class::where((new $class)->getRouteKeyName(), $slug)->firstOrFail();
    }
}
