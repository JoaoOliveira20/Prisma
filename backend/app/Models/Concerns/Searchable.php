<?php

namespace App\Models\Concerns;

use Illuminate\Database\Eloquent\Builder;

trait Searchable
{
    public function scopeMatching(Builder $query, ?string $term, array $columns): void
    {
        if ($term === null || $term === '') {
            return;
        }

        $pattern = '%'.preg_replace('/[!%_]/', '!$0', $term).'%';

        $grammar = $query->getQuery()->getGrammar();

        $query->where(function (Builder $query) use ($columns, $pattern, $grammar) {
            foreach ($columns as $column) {
                $query->orWhereRaw($grammar->wrap($query->qualifyColumn($column))." like ? escape '!'", [$pattern]);
            }
        });
    }
}
