<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreStrategyRequest;
use App\Http\Resources\StrategyResource;
use App\Models\Strategy;
use App\Models\Style;
use App\Models\Tag;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StrategyController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'q' => ['nullable', 'string', 'max:120'],
            'tag' => ['nullable', 'string', 'max:120'],
            'sort' => ['nullable', 'in:name,recent'],
            'per_page' => ['nullable', 'integer', 'between:1,100'],
        ]);

        $items = Strategy::query()
            ->with('tags')
            ->withFavoriteFlag($request->user())
            ->matching($request->q, ['name', 'summary', 'category'])
            ->when($request->tag, fn ($query, $tag) => $query->whereHas('tags', fn ($query) => $query->where('slug', $tag)))
            ->when(
                $request->sort === 'recent',
                fn ($query) => $query->latest('id'),
                fn ($query) => $query->orderBy('name'),
            )
            ->paginate($request->integer('per_page', 24));

        return StrategyResource::collection($items);
    }

    public function show(Request $request, Strategy $strategy): StrategyResource
    {
        $user = $request->user();

        $strategy->load([
            'tags',
            'references' => fn ($query) => $query->withUserState($user),
            'styles' => fn ($query) => $query->with('tags')->withFavoriteFlag($user),
        ])
            ->loadFavoriteFlag($request->user())
            ->loadGroupIds($request->user());

        return new StrategyResource($strategy);
    }

    public function store(StoreStrategyRequest $request): JsonResponse
    {
        $strategy = $request->user()->strategies()->create($request->safe()->except(['tags', 'styles', 'image', 'remove_image']));
        $strategy->applyImageChanges($request);
        $this->syncRelations($strategy, $request);

        return (new StrategyResource($strategy->load(['tags', 'styles'])))->response()->setStatusCode(201);
    }

    public function update(StoreStrategyRequest $request, Strategy $strategy): StrategyResource
    {
        $this->authorize('update', $strategy);

        $strategy->update($request->safe()->except(['tags', 'styles', 'image', 'remove_image']));
        $strategy->applyImageChanges($request);
        $this->syncRelations($strategy, $request);

        return new StrategyResource($strategy->load(['tags', 'styles']));
    }

    public function destroy(Strategy $strategy): JsonResponse
    {
        $this->authorize('delete', $strategy);

        $strategy->delete();

        return response()->json(status: 204);
    }

    private function syncRelations(Strategy $strategy, StoreStrategyRequest $request): void
    {
        if ($request->has('tags')) {
            $strategy->tags()->sync(Tag::whereIn('slug', $request->validated('tags') ?? [])->pluck('id'));
        }

        if ($request->has('styles')) {
            $strategy->styles()->sync(Style::whereIn('slug', $request->validated('styles') ?? [])->pluck('id'));
        }
    }
}
