<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StrategyResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'slug' => $this->slug,
            'name' => $this->name,
            'category' => $this->category,
            'summary' => $this->summary,
            'description' => $this->description,
            'cover_url' => $this->displayImageUrl(),
            'has_uploaded_image' => $this->image_path !== null,
            'tags' => TagResource::collection($this->whenLoaded('tags')),
            'styles' => StyleResource::collection($this->whenLoaded('styles')),
            'references' => ReferenceItemResource::collection($this->whenLoaded('references')),
            'references_count' => $this->whenCounted('references'),
            'is_favorite' => (bool) ($this->is_favorite ?? false),
            'group_ids' => $this->when($this->group_ids !== null, fn () => $this->group_ids),
            'can' => [
                'update' => $request->user()?->can('update', $this->resource) ?? false,
                'delete' => $request->user()?->can('delete', $this->resource) ?? false,
            ],
        ];
    }
}
