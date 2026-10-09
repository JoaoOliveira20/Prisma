<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ReferenceItemResource;
use App\Models\Person;
use App\Models\ReferenceItem;
use App\Models\Strategy;
use App\Models\Style;
use Carbon\Carbon;
use Illuminate\Database\Query\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ImageController extends Controller
{
    private const MAIN_TAGS = 3;

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
            'tag' => ['nullable', 'string', 'max:120'],
            'person' => ['nullable', 'string', 'max:255'],
            'strategy' => ['nullable', 'string', 'max:255'],
            'group' => ['nullable', 'integer'],
            'sort' => ['nullable', 'in:recent,oldest'],
            'per_page' => ['nullable', 'integer', 'between:1,100'],
        ]);

        $style = $request->style ? Style::where('slug', $request->style)->first() : null;
        $person = $request->person ? Person::where('slug', $request->person)->first() : null;
        $strategy = $request->strategy ? Strategy::where('slug', $request->strategy)->first() : null;
        $owners = array_filter([$style, $person, $strategy]);
        $kinds = $request->kind ? [$request->kind] : ['reference', ...array_keys(self::SOURCES)];

        if (count($owners) < count(array_filter([$request->style, $request->person, $request->strategy]))) {
            return $this->emptyPage();
        }

        if ($person || $strategy) {
            $kinds = ['reference'];
        }

        $group = $request->group ? $request->user()->groups()->find($request->group) : null;

        if ($request->group && $group === null) {
            return $this->emptyPage();
        }

        $union = null;

        foreach ($kinds as $kind) {
            $query = $kind === 'reference'
                ? $this->referenceQuery($request, $owners)
                : $this->entityQuery($kind, $request, $style);

            if ($group) {
                $query->whereIn('id', DB::table('group_items')
                    ->select('groupable_id')
                    ->where('group_id', $group->id)
                    ->where('groupable_type', $kind));
            }

            $union = $union ? $union->unionAll($query) : $query;
        }

        $page = DB::query()
            ->fromSub($union, 'images')
            ->orderBy('created_at', $request->sort === 'oldest' ? 'asc' : 'desc')
            ->orderBy('kind')
            ->orderBy('id', $request->sort === 'oldest' ? 'asc' : 'desc')
            ->paginate($request->integer('per_page', 48));

        $references = ReferenceItem::whereIn('id', collect($page->items())->where('kind', 'reference')->pluck('id'))
            ->withUserState($request->user())
            ->get()
            ->keyBy('id');

        $tags = $this->entityTags(collect($page->items()));

        return response()->json([
            'data' => collect($page->items())->map(fn ($row) => $this->present($row, $references, $request, $tags))->all(),
            'meta' => [
                'current_page' => $page->currentPage(),
                'last_page' => $page->lastPage(),
                'total' => $page->total(),
            ],
        ]);
    }

    private function referenceQuery(Request $request, array $owners): Builder
    {
        return DB::table('reference_items')
            ->selectRaw("'reference' as kind, id, null as slug, title, description, image_url, image_path, created_at")
            ->where('user_id', $request->user()->id)
            ->tap(function (Builder $query) use ($owners) {
                foreach ($owners as $owner) {
                    $query->whereIn('id', DB::table('referenceables')
                        ->select('reference_item_id')
                        ->where('referenceable_type', $owner->getMorphClass())
                        ->where('referenceable_id', $owner->id));
                }
            })
            ->when($request->tag, fn (Builder $query, $tag) => $query->whereIn('id', DB::table('reference_item_tag')
                ->join('tags', 'tags.id', '=', 'reference_item_tag.tag_id')
                ->where('tags.slug', $tag)
                ->where('tags.user_id', $request->user()->id)
                ->select('reference_item_id')))
            ->when($request->q, fn (Builder $query, $term) => $this->matchingReference($query, $term, $request->user()->id));
    }

    private function matchingReference(Builder $query, string $term, int $userId): void
    {
        $pattern = '%'.preg_replace('/[!%_]/', '!$0', $term).'%';

        $query->where(function (Builder $query) use ($pattern, $userId) {
            foreach (['title', 'description', 'credit', 'source_url'] as $column) {
                $query->orWhereRaw("{$column} like ? escape '!'", [$pattern]);
            }

            $query->orWhereIn('id', DB::table('reference_item_tag')
                ->join('tags', 'tags.id', '=', 'reference_item_tag.tag_id')
                ->where('tags.user_id', $userId)
                ->whereRaw("tags.name like ? escape '!'", [$pattern])
                ->select('reference_item_id'));

            foreach (['style' => 'styles', 'person' => 'people', 'strategy' => 'strategies'] as $type => $table) {
                $query->orWhereIn('id', DB::table('referenceables')
                    ->where('referenceable_type', $type)
                    ->whereIn('referenceable_id', DB::table($table)->where('user_id', $userId)->whereRaw("name like ? escape '!'", [$pattern])->select('id'))
                    ->select('reference_item_id'));
            }
        });
    }

    private function entityQuery(string $kind, Request $request, ?Style $style): Builder
    {
        $source = self::SOURCES[$kind];

        return DB::table($source['table'])
            ->selectRaw("'{$kind}' as kind, id, slug, {$source['title']} as title, {$source['description']} as description, {$source['url']} as image_url, image_path, created_at")
            ->where(fn (Builder $query) => $query->whereNotNull($source['url'])->orWhereNotNull('image_path'))
            ->where('user_id', $request->user()->id)
            ->when($style, fn (Builder $query) => $this->relatedToStyle($query, $kind, $style))
            ->when($request->tag, fn (Builder $query, $tag) => $query->whereIn('id', DB::table("{$kind}_tag")
                ->join('tags', 'tags.id', '=', "{$kind}_tag.tag_id")
                ->where('tags.slug', $tag)
                ->where('tags.user_id', $request->user()->id)
                ->select("{$kind}_tag.{$kind}_id")))
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

    private function present(object $row, $references, Request $request, array $tags): array
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
            'created_at' => $row->created_at ? Carbon::parse($row->created_at)->toIso8601String() : null,
            'tags' => $tags["{$row->kind}:{$row->id}"] ?? [],
            'can' => ['update' => false, 'delete' => false],
        ];
    }

    private function entityTags($rows): array
    {
        $models = ['style' => Style::class, 'person' => Person::class, 'strategy' => Strategy::class];
        $tags = [];

        foreach ($models as $kind => $model) {
            $ids = $rows->where('kind', $kind)->pluck('id');

            if ($ids->isEmpty()) {
                continue;
            }

            foreach ($model::with('tags')->whereIn('id', $ids)->get() as $entity) {
                $tags["{$kind}:{$entity->id}"] = $entity->tags
                    ->take(self::MAIN_TAGS)
                    ->map(fn ($tag) => ['name' => $tag->name, 'slug' => $tag->slug])
                    ->values()
                    ->all();
            }
        }

        return $tags;
    }

    private function emptyPage(): JsonResponse
    {
        return response()->json(['data' => [], 'meta' => ['current_page' => 1, 'last_page' => 1, 'total' => 0]]);
    }
}
