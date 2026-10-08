<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ReferenceItemResource;
use App\Models\ReferenceItem;
use App\Models\Style;
use Illuminate\Database\Query\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ImageController extends Controller
{
    private const SOURCES = [
        'style' => ['table' => 'styles', 'title' => 'name', 'description' => 'summary', 'url' => 'cover_url'],
        'person' => ['table' => 'people', 'title' => 'name', 'description' => 'summary', 'url' => 'photo_url'],
        'strategy' => ['table' => 'strategies', 'title' => 'name', 'description' => 'summary', 'url' => 'cover_url'],
    ];

    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'q' => ['nullable', 'string', 'max:120'],
            'kind' => ['nullable', 'in:reference,style,person,strategy'],
            'style' => ['nullable', 'string', 'max:255'],
            'mine' => ['nullable', 'boolean'],
            'per_page' => ['nullable', 'integer', 'between:1,100'],
        ]);

        $style = $request->style ? Style::where('slug', $request->style)->first() : null;
        $kinds = $request->kind ? [$request->kind] : ['reference', ...array_keys(self::SOURCES)];

        if ($request->style && $style === null) {
            return $this->emptyPage();
        }

        $union = null;

        foreach ($kinds as $kind) {
            $query = $kind === 'reference'
                ? $this->referenceQuery($request, $style)
                : $this->entityQuery($kind, $request, $style);

            $union = $union ? $union->unionAll($query) : $query;
        }

        $page = DB::query()
            ->fromSub($union, 'images')
            ->orderByDesc('created_at')
            ->orderBy('kind')
            ->orderByDesc('id')
            ->paginate($request->integer('per_page', 48));

        $references = ReferenceItem::whereIn('id', collect($page->items())->where('kind', 'reference')->pluck('id'))
            ->withUserState($request->user())
            ->get()
            ->keyBy('id');

        return response()->json([
            'data' => collect($page->items())->map(fn ($row) => $this->present($row, $references, $request))->all(),
            'meta' => [
                'current_page' => $page->currentPage(),
                'last_page' => $page->lastPage(),
                'total' => $page->total(),
            ],
        ]);
    }

    private function referenceQuery(Request $request, ?Style $style): Builder
    {
        return DB::table('reference_items')
            ->selectRaw("'reference' as kind, id, null as slug, title, description, image_url, image_path, created_at")
            ->when($request->boolean('mine'), fn (Builder $query) => $query->where('user_id', $request->user()->id))
            ->when($style, fn (Builder $query) => $query->whereIn('id', DB::table('referenceables')
                ->select('reference_item_id')
                ->where('referenceable_type', 'style')
                ->where('referenceable_id', $style->id)))
            ->when($request->q, fn (Builder $query, $term) => $this->matching($query, $term, ['title', 'description', 'credit']));
    }

    private function entityQuery(string $kind, Request $request, ?Style $style): Builder
    {
        $source = self::SOURCES[$kind];

        return DB::table($source['table'])
            ->selectRaw("'{$kind}' as kind, id, slug, {$source['title']} as title, {$source['description']} as description, {$source['url']} as image_url, image_path, created_at")
            ->where(fn (Builder $query) => $query->whereNotNull($source['url'])->orWhereNotNull('image_path'))
            ->when($request->boolean('mine'), fn (Builder $query) => $query->where('user_id', $request->user()->id))
            ->when($style, fn (Builder $query) => $this->relatedToStyle($query, $kind, $style))
            ->when($request->q, fn (Builder $query, $term) => $this->matching($query, $term, [$source['title'], $source['description']]));
    }

    private function relatedToStyle(Builder $query, string $kind, Style $style): void
    {
        match ($kind) {
            'style' => $query->where('id', $style->id),
            'person' => $query->whereIn('id', DB::table('person_style')->select('person_id')->where('style_id', $style->id)),
            'strategy' => $query->whereIn('id', DB::table('strategy_style')->select('strategy_id')->where('style_id', $style->id)),
        };
    }

    private function matching(Builder $query, string $term, array $columns): void
    {
        $pattern = '%'.preg_replace('/[!%_]/', '!$0', $term).'%';

        $query->where(function (Builder $query) use ($columns, $pattern) {
            foreach ($columns as $column) {
                $query->orWhereRaw("{$column} like ? escape '!'", [$pattern]);
            }
        });
    }

    private function present(object $row, $references, Request $request): array
    {
        if ($row->kind === 'reference') {
            return [
                'key' => "reference:{$row->id}",
                'kind' => 'reference',
                'slug' => null,
                ...(new ReferenceItemResource($references[$row->id]))->resolve($request),
            ];
        }

        return [
            'key' => "{$row->kind}:{$row->id}",
            'kind' => $row->kind,
            'id' => null,
            'slug' => $row->slug,
            'title' => $row->title,
            'description' => $row->description,
            'image_url' => $row->image_path ? Storage::disk('public')->url($row->image_path) : $row->image_url,
            'can' => ['update' => false, 'delete' => false],
        ];
    }

    private function emptyPage(): JsonResponse
    {
        return response()->json(['data' => [], 'meta' => ['current_page' => 1, 'last_page' => 1, 'total' => 0]]);
    }
}
