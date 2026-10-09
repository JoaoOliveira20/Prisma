<?php

namespace Tests\Feature;

use App\Models\Person;
use App\Models\ReferenceItem;
use App\Models\Style;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ReferenceApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_reference_by_url_can_link_to_several_entity_types(): void
    {
        $user = User::factory()->create();
        $style = Style::factory()->for($user, 'owner')->create();
        $person = Person::factory()->for($user, 'owner')->create();
        Sanctum::actingAs($user);

        $this->postJson('/api/references', [
            'title' => 'Cartaz',
            'image_url' => 'https://example.com/a.jpg',
            'links' => [
                ['type' => 'style', 'slug' => $style->slug],
                ['type' => 'person', 'slug' => $person->slug],
            ],
        ])->assertCreated()->assertJsonCount(2, 'data.links');

        $this->getJson("/api/styles/{$style->slug}")->assertJsonCount(1, 'data.references');
        $this->getJson("/api/people/{$person->slug}")->assertJsonCount(1, 'data.references');
        $this->getJson("/api/references?type=person&slug={$person->slug}")->assertJsonCount(1, 'data');
        $this->getJson('/api/references?type=style&slug='.Style::factory()->for($user, 'owner')->create()->slug)->assertJsonCount(0, 'data');
    }

    public function test_reference_can_be_uploaded_and_file_is_removed_on_delete(): void
    {
        Storage::fake('public');
        Sanctum::actingAs(User::factory()->create());

        $response = $this->post('/api/references', [
            'title' => 'Foto',
            'image' => UploadedFile::fake()->image('foto.jpg', 400, 300),
        ], ['Accept' => 'application/json'])->assertCreated();

        $path = ReferenceItem::firstOrFail()->image_path;
        Storage::disk('public')->assertExists($path);
        $this->assertStringContainsString($path, $response->json('data.image_url'));

        $this->deleteJson('/api/references/'.$response->json('data.id'))->assertNoContent();
        Storage::disk('public')->assertMissing($path);
    }

    public function test_reference_requires_image_and_rejects_non_images(): void
    {
        Storage::fake('public');
        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/references', ['title' => 'Sem imagem'])->assertUnprocessable()->assertJsonValidationErrors('image');
        $this->post('/api/references', [
            'title' => 'Script',
            'image' => UploadedFile::fake()->create('x.php', 10, 'application/x-php'),
        ], ['Accept' => 'application/json'])->assertUnprocessable()->assertJsonValidationErrors('image');
        $this->assertDatabaseCount('reference_items', 0);
    }

    public function test_cannot_link_reference_to_someone_elses_entity(): void
    {
        $style = Style::factory()->create();
        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/references', [
            'title' => 'Intruso',
            'image_url' => 'https://example.com/b.jpg',
            'links' => [['type' => 'style', 'slug' => $style->slug]],
        ])->assertNotFound();
        $this->assertDatabaseCount('reference_items', 0);
    }

    public function test_only_owner_can_delete_reference(): void
    {
        $reference = User::factory()->create()->referenceItems()->create([
            'title' => 'X',
            'image_url' => 'https://example.com/x.jpg',
        ]);
        Sanctum::actingAs(User::factory()->create());

        $this->deleteJson("/api/references/{$reference->id}")->assertNotFound();
        $this->getJson("/api/references/{$reference->id}")->assertNotFound();
        $this->assertModelExists($reference);
    }

    public function test_owner_can_update_reference_and_replace_links(): void
    {
        $user = User::factory()->create();
        $style = Style::factory()->for($user, 'owner')->create();
        $person = Person::factory()->for($user, 'owner')->create();
        $reference = $user->referenceItems()->create(['title' => 'Antigo', 'image_url' => 'https://example.com/x.jpg']);
        $style->references()->attach($reference);
        Sanctum::actingAs($user);

        $this->putJson("/api/references/{$reference->id}", [
            'title' => 'Novo',
            'links' => [['type' => 'person', 'slug' => $person->slug]],
        ])->assertOk()->assertJsonPath('data.title', 'Novo')->assertJsonCount(1, 'data.links')->assertJsonPath('data.links.0.type', 'person');

        $this->assertDatabaseCount('referenceables', 1);
    }

    public function test_only_owner_can_update_reference(): void
    {
        $reference = User::factory()->create()->referenceItems()->create(['title' => 'X', 'image_url' => 'https://example.com/x.jpg']);
        Sanctum::actingAs(User::factory()->create());

        $this->putJson("/api/references/{$reference->id}", ['title' => 'Hack'])->assertNotFound();
    }

    public function test_reference_tags_are_validated_and_synced_on_create_and_update(): void
    {
        $user = User::factory()->create();
        $arte = $this->tagFor($user, 'Arte');
        $cor = $this->tagFor($user, 'Cor');
        $foreign = $this->tagFor(User::factory()->create(), 'Alheia');
        Sanctum::actingAs($user);

        $this->postJson('/api/references', ['title' => 'A', 'image_url' => 'https://example.com/a.jpg', 'tags' => [$foreign->slug]])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('tags.0');

        $this->postJson('/api/references', ['title' => 'A', 'image_url' => 'https://example.com/a.jpg', 'tags' => ['nao-existe']])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('tags.0');

        $id = $this->postJson('/api/references', ['title' => 'A', 'image_url' => 'https://example.com/a.jpg', 'tags' => [$arte->slug, $cor->slug]])
            ->assertCreated()
            ->assertJsonCount(2, 'data.tags')
            ->json('data.id');

        $this->putJson("/api/references/{$id}", ['title' => 'A', 'tags' => [$cor->slug]])->assertJsonPath('data.tags.0.slug', $cor->slug)->assertJsonCount(1, 'data.tags');
        $this->putJson("/api/references/{$id}", ['title' => 'A novo'])->assertJsonCount(1, 'data.tags');
        $this->putJson("/api/references/{$id}", ['title' => 'A', 'tags' => []])->assertJsonCount(0, 'data.tags');
    }

    public function test_tag_used_by_a_reference_cannot_be_deleted(): void
    {
        $user = User::factory()->create();
        $tag = $this->tagFor($user, 'Cartaz');
        $reference = $user->referenceItems()->create(['title' => 'R', 'image_url' => 'https://example.com/r.jpg']);
        $reference->tags()->attach($tag);
        Sanctum::actingAs($user);

        $this->deleteJson("/api/tags/{$tag->slug}")->assertStatus(409);
    }

    public function test_several_references_can_be_linked_to_an_entity_at_once(): void
    {
        $user = User::factory()->create();
        $style = Style::factory()->for($user, 'owner')->create();
        $first = $user->referenceItems()->create(['title' => 'Um', 'image_url' => 'https://example.com/1.jpg']);
        $second = $user->referenceItems()->create(['title' => 'Dois', 'image_url' => 'https://example.com/2.jpg']);
        Sanctum::actingAs($user);

        $this->postJson('/api/references/links', ['references' => [$first->id, $second->id], 'type' => 'style', 'slug' => $style->slug])
            ->assertOk()
            ->assertJsonPath('linked', 2);

        $this->assertSame(2, $style->references()->count());
        $this->postJson('/api/references/links', ['references' => [$first->id], 'type' => 'style', 'slug' => $style->slug])->assertOk();
        $this->assertSame(2, $style->references()->count());
    }

    public function test_bulk_link_requires_owning_references_and_entity_and_valid_ids(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $mine = $user->referenceItems()->create(['title' => 'Minha', 'image_url' => 'https://example.com/1.jpg']);
        $theirs = $other->referenceItems()->create(['title' => 'Alheia', 'image_url' => 'https://example.com/2.jpg']);
        $ownStyle = Style::factory()->for($user, 'owner')->create();
        $foreignStyle = Style::factory()->for($other, 'owner')->create();
        Sanctum::actingAs($user);

        $this->postJson('/api/references/links', ['references' => [$mine->id, $theirs->id], 'type' => 'style', 'slug' => $ownStyle->slug])->assertNotFound();
        $this->postJson('/api/references/links', ['references' => [$mine->id], 'type' => 'style', 'slug' => $foreignStyle->slug])->assertNotFound();
        $this->postJson('/api/references/links', ['references' => [$mine->id, 9999], 'type' => 'style', 'slug' => $ownStyle->slug])->assertNotFound();
        $this->postJson('/api/references/links', ['references' => [], 'type' => 'style', 'slug' => $ownStyle->slug])->assertUnprocessable();
        $this->postJson('/api/references/links', ['references' => [$mine->id], 'type' => 'reference', 'slug' => 'x'])->assertUnprocessable();
        $this->assertSame(0, $ownStyle->references()->count());
    }

    public function test_reference_detail_lists_related_references_by_shared_links_and_tags(): void
    {
        $user = User::factory()->create();
        $style = Style::factory()->for($user, 'owner')->create();
        $tag = $this->tagFor($user, 'Cartaz');
        $make = fn (string $title) => $user->referenceItems()->create(['title' => $title, 'image_url' => 'https://example.com/x.jpg']);
        $main = $make('Principal');
        $both = $make('Estilo e tag');
        $byStyle = $make('Só estilo');
        $byTag = $make('Só tag');
        $make('Sem relação');
        $style->references()->attach([$main->id, $both->id, $byStyle->id]);
        $tag->referenceItems()->attach([$main->id, $both->id, $byTag->id]);
        Sanctum::actingAs($user);

        $response = $this->getJson("/api/references/{$main->id}")->assertOk();

        $this->assertSame(['Estilo e tag', 'Só tag', 'Só estilo'], collect($response->json('data.related'))->pluck('title')->all());
        $this->assertNotNull($response->json('data.created_at'));
        $lonely = $make('Sozinha');
        $this->getJson("/api/references/{$lonely->id}")->assertJsonCount(0, 'data.related');
    }
}
