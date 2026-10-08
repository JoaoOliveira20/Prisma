<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PersonResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'slug' => $this->slug,
            'name' => $this->name,
            'role' => $this->role,
            'summary' => $this->summary,
            'biography' => $this->biography,
            'period' => $this->period,
            'origin' => $this->origin,
            'photo_url' => $this->displayImageUrl(),
            'has_uploaded_image' => $this->image_path !== null,
            'tags' => TagResource::collection($this->whenLoaded('tags')),
            'styles' => StyleResource::collection($this->whenLoaded('styles')),
            'references' => ReferenceItemResource::collection($this->whenLoaded('references')),
            'is_favorite' => (bool) ($this->is_favorite ?? false),
            'group_ids' => $this->when($this->group_ids !== null, fn () => $this->group_ids),
            'can' => [
                'update' => $request->user()?->can('update', $this->resource) ?? false,
                'delete' => $request->user()?->can('delete', $this->resource) ?? false,
            ],
        ];
    }
}
