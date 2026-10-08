<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\GroupItemRequest;
use App\Models\Group;
use App\Models\GroupItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GroupItemController extends Controller
{
    public function store(GroupItemRequest $request, Group $group): JsonResponse
    {
        $this->authorize('view', $group);

        $item = GroupItem::resolveGroupable($request->type, $request->slug);
        $group->items()->firstOrCreate([
            'groupable_type' => $item->getMorphClass(),
            'groupable_id' => $item->getKey(),
        ]);

        return response()->json(['in_group' => true], 201);
    }

    public function destroy(Request $request, Group $group, string $type, string $slug): JsonResponse
    {
        $this->authorize('view', $group);

        $item = GroupItem::resolveGroupable($type, $slug);
        $group->items()
            ->where('groupable_type', $item->getMorphClass())
            ->where('groupable_id', $item->getKey())
            ->delete();

        return response()->json(['in_group' => false]);
    }
}
