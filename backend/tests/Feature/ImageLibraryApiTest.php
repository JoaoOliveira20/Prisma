<?php

namespace Tests\Feature;

use App\Models\Person;
use App\Models\Strategy;
use App\Models\Style;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ImageLibraryApiTest extends TestCase
{
    use RefreshDatabase;

    private function seedLibrary(): array
    {
        $owner = User::factory()->create();
        $style = Style::factory()->for($owner, 'owner')->create(['name' => 'Bauhaus', 'cover_url' => 'https://example.com/style.jpg', 'summary' => 'Resumo bauhaus']);
        $semImagem = Style::factory()->for($owner, 'owner')->create(['name' => 'Sem imagem']);
        $person = Person::factory()->for($owner, 'owner')->create(['name' => 'Gropius', 'photo_url' => 'https://example.com/person.jpg']);
        $person->styles()->attach($style);
        $strategy = Strategy::factory()->for($owner, 'owner')->create(['name' => 'Grade', 'cover_url' => 'https://example.com/strategy.jpg']);
        $reference = $owner->referenceItems()->create(['title' => 'Cartaz', 'description' => 'Um cartaz famoso', 'image_url' => 'https://example.com/ref.jpg']);
        $style->references()->attach($reference);
        $outra = $owner->referenceItems()->create(['title' => 'Solta', 'image_url' => 'https://example.com/solta.jpg']);

        Sanctum::actingAs($owner);

        return compact('owner', 'style', 'semImagem', 'person', 'strategy', 'reference', 'outra');
    }

    public function test_library_unifies_references_and_entity_images(): void
    {
        $this->seedLibrary();

        $response = $this->getJson('/api/images')->assertOk()->assertJsonPath('meta.total', 5);
        $kinds = collect($response->json('data'))->pluck('kind')->sort()->values()->all();
        $this->assertSame(['person', 'reference', 'reference', 'strategy', 'style'], $kinds);

        $reference = collect($response->json('data'))->firstWhere('title', 'Cartaz');
        $this->assertSame('Um cartaz famoso', $reference['description']);
        $this->assertSame('style', $reference['links'][0]['type']);
        $this->assertTrue($reference['can']['update']);
    }

    public function test_filters_by_kind_text_and_style(): void
    {
        ['style' => $style] = $this->seedLibrary();

        $this->getJson('/api/images?kind=reference')->assertJsonPath('meta.total', 2);
        $this->getJson('/api/images?kind=person')->assertJsonPath('meta.total', 1)->assertJsonPath('data.0.slug', 'gropius');
        $this->getJson('/api/images?q=famoso')->assertJsonPath('meta.total', 1);
        $this->getJson('/api/images?q=%25')->assertJsonPath('meta.total', 0);
        $this->getJson("/api/images?style={$style->slug}")->assertJsonPath('meta.total', 3);
        $this->getJson('/api/images?style=nao-existe')->assertJsonPath('meta.total', 0);
    }

    public function test_library_only_returns_the_users_own_images(): void
    {
        ['owner' => $owner] = $this->seedLibrary();

        Sanctum::actingAs(User::factory()->create());
        $this->getJson('/api/images')->assertJsonPath('meta.total', 0);
        $this->getJson('/api/images?q=Cartaz')->assertJsonPath('meta.total', 0);

        Sanctum::actingAs($owner);
        $this->getJson('/api/images')->assertJsonPath('meta.total', 5);
    }

    public function test_pagination_and_per_page_limit(): void
    {
        ['owner' => $owner] = $this->seedLibrary();
        Sanctum::actingAs($owner);

        $this->getJson('/api/images?per_page=2')->assertJsonCount(2, 'data')->assertJsonPath('meta.last_page', 3);
        $this->getJson('/api/images?per_page=2&page=3')->assertJsonCount(1, 'data');
        $this->getJson('/api/images?per_page=500')->assertUnprocessable();
    }

    public function test_reference_links_can_be_added_and_removed_individually(): void
    {
        ['owner' => $owner, 'reference' => $reference, 'person' => $person, 'style' => $style] = $this->seedLibrary();
        Sanctum::actingAs($owner);

        $this->postJson("/api/references/{$reference->id}/links", ['type' => 'person', 'slug' => $person->slug])
            ->assertOk()
            ->assertJsonCount(2, 'data.links');
        $this->postJson("/api/references/{$reference->id}/links", ['type' => 'person', 'slug' => $person->slug])
            ->assertOk()
            ->assertJsonCount(2, 'data.links');

        $this->deleteJson("/api/references/{$reference->id}/links/style/{$style->slug}")
            ->assertOk()
            ->assertJsonCount(1, 'data.links');
    }

    public function test_links_only_work_between_the_users_own_reference_and_entity(): void
    {
        ['owner' => $owner, 'reference' => $reference] = $this->seedLibrary();
        $intruder = User::factory()->create();
        $theirStyle = Style::factory()->for($intruder, 'owner')->create();
        $ownStyle = Style::factory()->for($owner, 'owner')->create();

        Sanctum::actingAs($intruder);
        $this->postJson("/api/references/{$reference->id}/links", ['type' => 'style', 'slug' => $theirStyle->slug])->assertNotFound();
        $this->deleteJson("/api/references/{$reference->id}/links/style/{$ownStyle->slug}")->assertNotFound();

        Sanctum::actingAs($owner);
        $this->postJson("/api/references/{$reference->id}/links", ['type' => 'style', 'slug' => $theirStyle->slug])->assertNotFound();
        $this->postJson("/api/references/{$reference->id}/links", ['type' => 'reference', 'slug' => '1'])->assertUnprocessable();
    }

    public function test_references_can_be_filtered_by_person_and_strategy(): void
    {
        ['owner' => $owner, 'person' => $person, 'strategy' => $strategy, 'reference' => $reference, 'style' => $style] = $this->seedLibrary();
        $person->references()->attach($reference);
        $strategy->references()->attach($owner->referenceItems()->create(['title' => 'Da estratégia', 'image_url' => 'https://example.com/s.jpg']));

        $this->getJson("/api/images?person={$person->slug}")->assertJsonPath('meta.total', 1)->assertJsonPath('data.0.title', 'Cartaz');
        $this->getJson("/api/images?strategy={$strategy->slug}")->assertJsonPath('meta.total', 1)->assertJsonPath('data.0.title', 'Da estratégia');
        $this->getJson("/api/images?person={$person->slug}&style={$style->slug}")->assertJsonPath('meta.total', 1);
        $this->getJson("/api/images?style={$style->slug}&kind=reference")->assertJsonPath('meta.total', 1);
        $this->getJson('/api/images?person=nao-existe')->assertJsonPath('meta.total', 0);
    }

    public function test_references_carry_their_own_tags_and_entities_their_main_ones(): void
    {
        ['owner' => $owner, 'style' => $style, 'reference' => $reference] = $this->seedLibrary();
        $tags = collect(['Alfa', 'Beta', 'Gama', 'Delta'])->map(fn ($name) => $this->tagFor($owner, $name));
        $style->tags()->attach($tags->pluck('id'));
        $reference->tags()->attach([$tags[3]->id, $tags[1]->id]);

        $data = collect($this->getJson('/api/images')->json('data'));

        $this->assertSame(['Beta', 'Delta'], collect($data->firstWhere('title', 'Cartaz')['tags'])->pluck('name')->all());
        $this->assertSame([], $data->firstWhere('title', 'Solta')['tags']);
        $this->assertCount(3, $data->firstWhere('kind', 'style')['tags']);
    }

    public function test_library_can_be_filtered_by_tag_across_references_and_entities(): void
    {
        ['owner' => $owner, 'style' => $style, 'reference' => $reference] = $this->seedLibrary();
        $tag = $this->tagFor($owner, 'Cartaz');
        $reference->tags()->attach($tag);
        $style->tags()->attach($tag);

        $response = $this->getJson("/api/images?tag={$tag->slug}")->assertJsonPath('meta.total', 2);
        $this->assertEqualsCanonicalizing(['reference', 'style'], collect($response->json('data'))->pluck('kind')->all());
        $this->getJson('/api/images?tag=nenhuma')->assertJsonPath('meta.total', 0);
    }

    public function test_library_search_matches_tags_linked_names_and_source(): void
    {
        ['owner' => $owner, 'reference' => $reference] = $this->seedLibrary();
        $tag = $this->tagFor($owner, 'Tipografia suíça');
        $reference->tags()->attach($tag);
        $reference->update(['source_url' => 'https://museu.example.com/acervo']);

        $this->getJson('/api/images?kind=reference&q=suíça')->assertJsonPath('meta.total', 1)->assertJsonPath('data.0.title', 'Cartaz');
        $this->getJson('/api/images?kind=reference&q=Bauhaus')->assertJsonPath('meta.total', 1)->assertJsonPath('data.0.title', 'Cartaz');
        $this->getJson('/api/images?kind=reference&q=museu.example')->assertJsonPath('meta.total', 1);
        $this->getJson('/api/images?kind=reference&q=inexistente')->assertJsonPath('meta.total', 0);
    }

    public function test_library_can_be_sorted_and_limited_to_one_of_the_users_groups(): void
    {
        ['owner' => $owner, 'reference' => $reference, 'outra' => $outra, 'style' => $style] = $this->seedLibrary();
        $group = $owner->groups()->create(['name' => 'Estudar depois']);
        $group->items()->create(['groupable_type' => 'reference', 'groupable_id' => $outra->id]);
        $group->items()->create(['groupable_type' => 'style', 'groupable_id' => $style->id]);
        $foreign = User::factory()->create()->groups()->create(['name' => 'De outro']);

        $this->getJson("/api/images?group={$group->id}")->assertJsonPath('meta.total', 2);
        $this->getJson("/api/images?group={$group->id}&kind=reference")->assertJsonPath('meta.total', 1)->assertJsonPath('data.0.title', 'Solta');
        $this->getJson("/api/images?group={$foreign->id}")->assertJsonPath('meta.total', 0);

        $oldest = $this->getJson('/api/images?kind=reference&sort=oldest')->json('data.0.id');
        $newest = $this->getJson('/api/images?kind=reference&sort=recent')->json('data.0.id');
        $this->assertSame($reference->id, $oldest);
        $this->assertSame($outra->id, $newest);
    }
}
