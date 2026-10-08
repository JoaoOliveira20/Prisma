<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreReferenceItemRequest;
use App\Http\Requests\UpdateReferenceItemRequest;
use App\Http\Resources\ReferenceItemResource;
use App\Models\GroupItem;
use App\Models\ReferenceItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReferenceItemController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'q' => ['nullable', 'string', 'max:120'],
            'type' => ['nullable', 'in:style,person,strategy', 'required_with:slug'],
            'slug' => ['nullable', 'string', 'max:255'],
            'per_page' => ['nullable', 'integer', 'between:1,100'],
        ]);

        $references = ReferenceItem::query()
            ->withUserState($request->user())
            ->matching($request->q, ['title', 'credit'])
            ->when($request->type && $request->slug, function ($query) use ($request) {
                $entity = GroupItem::resolveGroupable($request->type, $request->slug);
                $relation = ['style' => 'styles', 'person' => 'people', 'strategy' => 'strategies'][$request->type];
                $query->whereRelation($relation, $entity->getTable().'.id', $entity->getKey());
            })
            ->latest('id')
            ->paginate($request->integer('per_page', 60));

        return ReferenceItemResource::collection($references);
    }

    public function store(StoreReferenceItemRequest $request): JsonResponse
    {
        $entities = collect($request->validated('links', []))
            ->map(fn (array $link) => GroupItem::resolveGroupable($link['type'], $link['slug']))
            ->each(fn ($entity) => $this->authorize('update', $entity));

        $reference = $request->user()->referenceItems()->create([
            ...$request->safe()->only(['title', 'image_url', 'source_url', 'credit', 'description']),
            'image_path' => $request->file('image')?->store('references', 'public'),
        ]);

        $entities->each(fn ($entity) => $entity->references()->attach($reference));

        return (new ReferenceItemResource($reference->loadUserState($request->user())))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Request $request, ReferenceItem $referenceItem): ReferenceItemResource
    {
        return new ReferenceItemResource($referenceItem->loadUserState($request->user()));
    }

    public function update(UpdateReferenceItemRequest $request, ReferenceItem $referenceItem): ReferenceItemResource
    {
        $this->authorize('update', $referenceItem);

        $entities = collect($request->validated('links', []))
            ->map(fn (array $link) => GroupItem::resolveGroupable($link['type'], $link['slug']))
            ->each(fn ($entity) => $this->authorize('update', $entity));

        $referenceItem->update($request->safe()->except('links'));

        if ($request->has('links')) {
            foreach (['styles' => 'style', 'people' => 'person', 'strategies' => 'strategy'] as $relation => $type) {
                $referenceItem->$relation()->sync(
                    $entities->filter(fn ($entity) => $entity->getMorphClass() === $type)->map->getKey()
                );
            }
        }

        return new ReferenceItemResource($referenceItem->loadUserState($request->user()));
    }

    public function destroy(ReferenceItem $referenceItem): JsonResponse
    {
        $this->authorize('delete', $referenceItem);

        $referenceItem->delete();

        return response()->json(status: 204);
    }
}
