<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GroupItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    public function store(Request $request, string $type, string $slug): JsonResponse
    {
        $item = GroupItem::resolveGroupable($type, $slug);

        $request->user()->favoritesGroup()->items()->firstOrCreate([
            'groupable_type' => $item->getMorphClass(),
            'groupable_id' => $item->getKey(),
        ]);

        return response()->json(['is_favorite' => true]);
    }

    public function destroy(Request $request, string $type, string $slug): JsonResponse
    {
        $item = GroupItem::resolveGroupable($type, $slug);

        $request->user()->favoritesGroup()->items()
            ->where('groupable_type', $item->getMorphClass())
            ->where('groupable_id', $item->getKey())
            ->delete();

        return response()->json(['is_favorite' => false]);
    }
}
