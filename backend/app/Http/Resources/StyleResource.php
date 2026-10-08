<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StyleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'slug' => $this->slug,
            'name' => $this->name,
            'summary' => $this->summary,
            'history' => $this->history,
            'influences' => $this->influences,
            'characteristics' => $this->characteristics ?? [],
            'period' => $this->period,
            'origin' => $this->origin,
            'cover_url' => $this->displayImageUrl(),
            'has_uploaded_image' => $this->image_path !== null,
            'tags' => TagResource::collection($this->whenLoaded('tags')),
            'references' => ReferenceItemResource::collection($this->whenLoaded('references')),
            'people' => PersonResource::collection($this->whenLoaded('people')),
            'strategies' => StrategyResource::collection($this->whenLoaded('strategies')),
            'is_favorite' => (bool) ($this->is_favorite ?? false),
            'group_ids' => $this->when($this->group_ids !== null, fn () => $this->group_ids),
            'can' => [
                'update' => $request->user()?->can('update', $this->resource) ?? false,
                'delete' => $request->user()?->can('delete', $this->resource) ?? false,
            ],
        ];
    }
}
