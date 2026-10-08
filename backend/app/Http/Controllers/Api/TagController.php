<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\SaveTagRequest;
use App\Http\Resources\TagResource;
use App\Models\Tag;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TagController extends Controller
{
    public function index(Request $request)
    {
        $request->validate(['q' => ['nullable', 'string', 'max:120']]);

        return TagResource::collection(
            Tag::query()
                ->withCount(['styles', 'people', 'strategies', 'referenceItems'])
                ->matching($request->q, ['name'])
                ->orderBy('name')
                ->get()
        );
    }

    public function store(SaveTagRequest $request): JsonResponse
    {
        $tag = Tag::make($request->validated());
        $tag->user_id = $request->user()->id;
        $tag->save();

        return (new TagResource($tag->loadCount(['styles', 'people', 'strategies', 'referenceItems'])))->response()->setStatusCode(201);
    }

    public function update(SaveTagRequest $request, Tag $tag): TagResource
    {
        $this->authorize('update', $tag);

        $tag->update($request->validated());

        return new TagResource($tag->loadCount(['styles', 'people', 'strategies', 'referenceItems']));
    }

    public function destroy(Tag $tag): JsonResponse
    {
        $this->authorize('delete', $tag);

        if ($tag->isInUse()) {
            return response()->json(['message' => __('Esta tag está em uso e não pode ser excluída.')], 409);
        }

        $tag->delete();

        return response()->json(status: 204);
    }
}
