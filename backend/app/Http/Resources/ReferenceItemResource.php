<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReferenceItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'image_url' => $this->displayUrl(),
            'source_url' => $this->source_url,
            'credit' => $this->credit,
            'description' => $this->description,
            'links' => $this->when(
                $this->relationLoaded('styles'),
                fn () => collect()
                    ->concat($this->styles->map(fn ($item) => ['type' => 'style', 'slug' => $item->slug, 'name' => $item->name]))
                    ->concat($this->people->map(fn ($item) => ['type' => 'person', 'slug' => $item->slug, 'name' => $item->name]))
                    ->concat($this->strategies->map(fn ($item) => ['type' => 'strategy', 'slug' => $item->slug, 'name' => $item->name]))
                    ->values(),
            ),
            'is_favorite' => (bool) ($this->is_favorite ?? false),
            'group_ids' => $this->whenLoaded('groupItems', fn () => $this->groupItems->pluck('group_id')->values()),
            'can' => [
                'update' => $request->user()?->can('update', $this->resource) ?? false,
                'delete' => $request->user()?->can('delete', $this->resource) ?? false,
            ],
        ];
    }
}
