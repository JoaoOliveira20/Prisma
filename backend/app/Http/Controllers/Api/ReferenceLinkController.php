<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\GroupItemRequest;
use App\Http\Resources\ReferenceItemResource;
use App\Models\GroupItem;
use App\Models\ReferenceItem;
use Illuminate\Http\Request;

class ReferenceLinkController extends Controller
{
    public function store(GroupItemRequest $request, ReferenceItem $referenceItem): ReferenceItemResource
    {
        abort_if($request->type === 'reference', 422);
        $this->authorize('update', $referenceItem);

        $entity = GroupItem::resolveGroupable($request->type, $request->slug);
        $this->authorize('update', $entity);

        $entity->references()->syncWithoutDetaching([$referenceItem->id]);

        return new ReferenceItemResource($referenceItem->loadUserState($request->user()));
    }

    public function destroy(Request $request, ReferenceItem $referenceItem, string $type, string $slug): ReferenceItemResource
    {
        abort_if($type === 'reference', 422);
        $this->authorize('update', $referenceItem);

        GroupItem::resolveGroupable($type, $slug)->references()->detach($referenceItem->id);

        return new ReferenceItemResource($referenceItem->loadUserState($request->user()));
    }
}
