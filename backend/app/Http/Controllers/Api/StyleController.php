<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreStyleRequest;
use App\Http\Resources\StyleResource;
use App\Models\Style;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StyleController extends Controller
{
    private const PREVIEW_REFERENCES = 8;

    private const PREVIEW_PEOPLE = 6;

    private const PREVIEW_STRATEGIES = 5;

    public function index(Request $request)
    {
        $request->validate([
            'q' => ['nullable', 'string', 'max:120'],
            'tag' => ['nullable', 'string', 'max:120'],
            'sort' => ['nullable', 'in:name,recent'],
            'per_page' => ['nullable', 'integer', 'between:1,100'],
        ]);

        $styles = Style::query()
            ->with('tags')
            ->withFavoriteFlag($request->user())
            ->matching($request->q, ['name', 'summary', 'period', 'origin'])
            ->when($request->tag, fn ($query, $tag) => $query->whereHas('tags', fn ($query) => $query->where('slug', $tag)))
            ->when(
                $request->sort === 'recent',
                fn ($query) => $query->latest('id'),
                fn ($query) => $query->orderBy('name'),
            )
            ->paginate($request->integer('per_page', 24));

        return StyleResource::collection($styles);
    }

    public function show(Request $request, Style $style): StyleResource
    {
        $user = $request->user();

        $style->load([
            'tags',
            'references' => fn ($query) => $query->withUserState($user)->limit(self::PREVIEW_REFERENCES),
            'people' => fn ($query) => $query->with('tags')->withFavoriteFlag($user)->orderBy('name')->limit(self::PREVIEW_PEOPLE),
            'strategies' => fn ($query) => $query->with('tags')->withFavoriteFlag($user)->orderBy('name')->limit(self::PREVIEW_STRATEGIES),
        ])
            ->loadCount(['references', 'people', 'strategies'])
            ->loadFavoriteFlag($request->user())
            ->loadGroupIds($request->user());

        $style->setRelation('related', $this->relatedStyles($style, $user));

        return new StyleResource($style);
    }

    public function store(StoreStyleRequest $request): JsonResponse
    {
        $style = $request->user()->styles()->create($request->safe()->except(['tags', 'image', 'remove_image']));
        $style->applyImageChanges($request);
        $this->syncTags($style, $request);

        return (new StyleResource($style->load('tags')))->response()->setStatusCode(201);
    }

    public function update(StoreStyleRequest $request, Style $style): StyleResource
    {
        $this->authorize('update', $style);

        $style->update($request->safe()->except(['tags', 'image', 'remove_image']));
        $style->applyImageChanges($request);
        $this->syncTags($style, $request);

        return new StyleResource($style->load(['tags', 'references']));
    }

    public function destroy(Style $style): JsonResponse
    {
        $this->authorize('delete', $style);

        $style->delete();

        return response()->json(status: 204);
    }

    private function syncTags(Style $style, StoreStyleRequest $request): void
    {
        if ($request->has('tags')) {
            $style->tags()->sync(Tag::whereIn('slug', $request->validated('tags') ?? [])->pluck('id'));
        }
    }

    private function relatedStyles(Style $style, User $user): Collection
    {
        $tagIds = $style->tags->pluck('id');

        if ($tagIds->isEmpty()) {
            return new Collection;
        }

        return Style::query()
            ->whereKeyNot($style->id)
            ->withCount(['tags as shared_tags_count' => fn ($query) => $query->whereIn('tags.id', $tagIds)])
            ->whereHas('tags', fn ($query) => $query->whereIn('tags.id', $tagIds))
            ->with('tags')
            ->withFavoriteFlag($user)
            ->orderByDesc('shared_tags_count')
            ->orderBy('name')
            ->limit(4)
            ->get();
    }
}
