<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePersonRequest;
use App\Http\Resources\PersonResource;
use App\Models\Person;
use App\Models\Style;
use App\Models\Tag;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PersonController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'q' => ['nullable', 'string', 'max:120'],
            'tag' => ['nullable', 'string', 'max:120'],
            'sort' => ['nullable', 'in:name,recent'],
            'per_page' => ['nullable', 'integer', 'between:1,100'],
        ]);

        $items = Person::query()
            ->with('tags')
            ->withFavoriteFlag($request->user())
            ->matching($request->q, ['name', 'summary', 'role', 'period', 'origin'])
            ->when($request->tag, fn ($query, $tag) => $query->whereHas('tags', fn ($query) => $query->where('slug', $tag)))
            ->when(
                $request->sort === 'recent',
                fn ($query) => $query->latest('id'),
                fn ($query) => $query->orderBy('name'),
            )
            ->paginate($request->integer('per_page', 24));

        return PersonResource::collection($items);
    }

    public function show(Request $request, Person $person): PersonResource
    {
        $user = $request->user();

        $person->load([
            'tags',
            'references' => fn ($query) => $query->withUserState($user),
            'styles' => fn ($query) => $query->with('tags')->withFavoriteFlag($user),
        ])
            ->loadFavoriteFlag($request->user())
            ->loadGroupIds($request->user());

        return new PersonResource($person);
    }

    public function store(StorePersonRequest $request): JsonResponse
    {
        $person = $request->user()->people()->create($request->safe()->except(['tags', 'styles', 'image', 'remove_image']));
        $person->applyImageChanges($request);
        $this->syncRelations($person, $request);

        return (new PersonResource($person->load(['tags', 'styles'])))->response()->setStatusCode(201);
    }

    public function update(StorePersonRequest $request, Person $person): PersonResource
    {
        $this->authorize('update', $person);

        $person->update($request->safe()->except(['tags', 'styles', 'image', 'remove_image']));
        $person->applyImageChanges($request);
        $this->syncRelations($person, $request);

        return new PersonResource($person->load(['tags', 'styles']));
    }

    public function destroy(Person $person): JsonResponse
    {
        $this->authorize('delete', $person);

        $person->delete();

        return response()->json(status: 204);
    }

    private function syncRelations(Person $person, StorePersonRequest $request): void
    {
        if ($request->has('tags')) {
            $person->tags()->sync(Tag::whereIn('slug', $request->validated('tags') ?? [])->pluck('id'));
        }

        if ($request->has('styles')) {
            $person->styles()->sync(Style::whereIn('slug', $request->validated('styles') ?? [])->pluck('id'));
        }
    }
}
