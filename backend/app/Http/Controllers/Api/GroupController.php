<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\SaveGroupRequest;
use App\Http\Resources\GroupResource;
use App\Http\Resources\PersonResource;
use App\Http\Resources\ReferenceItemResource;
use App\Http\Resources\StrategyResource;
use App\Http\Resources\StyleResource;
use App\Models\Group;
use App\Models\Person;
use App\Models\ReferenceItem;
use App\Models\Strategy;
use App\Models\Style;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GroupController extends Controller
{
    public function index(Request $request)
    {
        $request->validate(['q' => ['nullable', 'string', 'max:120']]);
        $request->user()->favoritesGroup();

        return GroupResource::collection(
            $request->user()->groups()
                ->withCount('items')
                ->matching($request->q, ['name'])
                ->orderByDesc('is_favorites')
                ->orderBy('name')
                ->get()
        );
    }

    public function show(Request $request, Group $group): JsonResponse
    {
        $this->authorize('view', $group);

        $user = $request->user();
        $inGroup = fn ($query) => $query->where('group_id', $group->id);

        $styles = Style::whereHas('groupItems', $inGroup)->with('tags')->withFavoriteFlag($user)->orderBy('name')->get();
        $people = Person::whereHas('groupItems', $inGroup)->with('tags')->withFavoriteFlag($user)->orderBy('name')->get();
        $strategies = Strategy::whereHas('groupItems', $inGroup)->with('tags')->withFavoriteFlag($user)->orderBy('name')->get();

        $references = ReferenceItem::whereHas('groupItems', $inGroup)->withUserState($user)->latest('id')->get();

        return response()->json([
            'data' => [
                ...(new GroupResource($group->loadCount('items')))->resolve($request),
                'styles' => StyleResource::collection($styles)->resolve($request),
                'people' => PersonResource::collection($people)->resolve($request),
                'strategies' => StrategyResource::collection($strategies)->resolve($request),
                'references' => ReferenceItemResource::collection($references)->resolve($request),
            ],
        ]);
    }

    public function store(SaveGroupRequest $request): JsonResponse
    {
        $group = $request->user()->groups()->create($request->validated());

        return (new GroupResource($group))->response()->setStatusCode(201);
    }

    public function update(SaveGroupRequest $request, Group $group): GroupResource
    {
        $this->authorize('update', $group);

        $group->update($request->validated());

        return new GroupResource($group);
    }

    public function destroy(Group $group): JsonResponse
    {
        $this->authorize('delete', $group);

        $group->delete();

        return response()->json(status: 204);
    }
}
