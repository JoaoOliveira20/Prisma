<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GroupItem;
use App\Models\ReferenceItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ReferenceBulkLinkController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'references' => ['required', 'array', 'min:1', 'max:100'],
            'references.*' => ['integer', 'distinct'],
            'type' => ['required', Rule::in(['style', 'person', 'strategy'])],
            'slug' => ['required', 'string', 'max:255'],
        ]);

        $references = ReferenceItem::whereIn('id', $data['references'])->get();
        abort_if($references->count() !== count($data['references']), 404);
        $references->each(fn (ReferenceItem $reference) => $this->authorize('update', $reference));

        $entity = GroupItem::resolveGroupable($data['type'], $data['slug']);
        $this->authorize('update', $entity);

        $entity->references()->syncWithoutDetaching($references->modelKeys());

        return response()->json(['linked' => $references->count()]);
    }
}
