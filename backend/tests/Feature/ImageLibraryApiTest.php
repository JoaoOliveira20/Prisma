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

        return compact('owner', 'style', 'semImagem', 'person', 'strategy', 'reference', 'outra');
    }

    public function test_library_unifies_references_and_entity_images(): void
    {
        $this->seedLibrary();
        Sanctum::actingAs(User::factory()->create());

        $response = $this->getJson('/api/images')->assertOk()->assertJsonPath('meta.total', 5);
        $kinds = collect($response->json('data'))->pluck('kind')->sort()->values()->all();
        $this->assertSame(['person', 'reference', 'reference', 'strategy', 'style'], $kinds);

        $reference = collect($response->json('data'))->firstWhere('title', 'Cartaz');
        $this->assertSame('Um cartaz famoso', $reference['description']);
        $this->assertSame('style', $reference['links'][0]['type']);
        $this->assertFalse($reference['can']['update']);
    }

    public function test_filters_by_kind_text_and_style(): void
    {
        ['style' => $style] = $this->seedLibrary();
        Sanctum::actingAs(User::factory()->create());

        $this->getJson('/api/images?kind=reference')->assertJsonPath('meta.total', 2);
        $this->getJson('/api/images?kind=person')->assertJsonPath('meta.total', 1)->assertJsonPath('data.0.slug', 'gropius');
        $this->getJson('/api/images?q=famoso')->assertJsonPath('meta.total', 1);
        $this->getJson('/api/images?q=%25')->assertJsonPath('meta.total', 0);
        $this->getJson("/api/images?style={$style->slug}")->assertJsonPath('meta.total', 3);
        $this->getJson('/api/images?style=nao-existe')->assertJsonPath('meta.total', 0);
    }

    public function test_mine_filter_only_returns_the_users_own_items(): void
    {
        ['owner' => $owner] = $this->seedLibrary();

        Sanctum::actingAs(User::factory()->create());
        $this->getJson('/api/images?mine=1')->assertJsonPath('meta.total', 0);

        Sanctum::actingAs($owner);
        $this->getJson('/api/images?mine=1')->assertJsonPath('meta.total', 5);
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

    public function test_links_require_owning_both_the_reference_and_the_entity(): void
    {
        ['owner' => $owner, 'reference' => $reference] = $this->seedLibrary();
        $intruder = User::factory()->create();
        $theirStyle = Style::factory()->for($intruder, 'owner')->create();
        $ownStyle = Style::factory()->for($owner, 'owner')->create();

        Sanctum::actingAs($intruder);
        $this->postJson("/api/references/{$reference->id}/links", ['type' => 'style', 'slug' => $theirStyle->slug])->assertForbidden();
        $this->deleteJson("/api/references/{$reference->id}/links/style/{$ownStyle->slug}")->assertForbidden();

        Sanctum::actingAs($owner);
        $this->postJson("/api/references/{$reference->id}/links", ['type' => 'style', 'slug' => $theirStyle->slug])->assertForbidden();
        $this->postJson("/api/references/{$reference->id}/links", ['type' => 'reference', 'slug' => '1'])->assertUnprocessable();
    }
}
