<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TagResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'name' => $this->name,
            'slug' => $this->slug,
            'usage_count' => $this->when(
                isset($this->styles_count),
                fn () => $this->styles_count + $this->people_count + $this->strategies_count + $this->reference_items_count,
            ),
            'can' => $this->when(
                $request->routeIs('tags.*'),
                fn () => [
                    'update' => $request->user()->can('update', $this->resource),
                    'delete' => $request->user()->can('delete', $this->resource),
                ],
            ),
        ];
    }
}
