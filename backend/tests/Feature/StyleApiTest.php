<?php

namespace Tests\Feature;

use App\Models\Person;
use App\Models\Strategy;
use App\Models\Style;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class StyleApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_list_and_search_styles(): void
    {
        $user = User::factory()->create();
        Style::factory()->for($user, 'owner')->create(['name' => 'Bauhaus']);
        Style::factory()->for($user, 'owner')->create(['name' => 'Vaporwave']);
        Style::factory()->create(['name' => 'De outra pessoa']);
        Sanctum::actingAs($user);

        $this->getJson('/api/styles')->assertOk()->assertJsonCount(2, 'data');
        $this->getJson('/api/styles?q=bau')->assertOk()->assertJsonCount(1, 'data');
    }

    public function test_styles_can_be_sorted_by_most_recent(): void
    {
        $user = User::factory()->create();
        Style::factory()->for($user, 'owner')->create(['name' => 'Alfa']);
        Style::factory()->for($user, 'owner')->create(['name' => 'Zeta']);
        Sanctum::actingAs($user);

        $this->getJson('/api/styles?sort=recent')->assertJsonPath('data.0.name', 'Zeta');
        $this->getJson('/api/styles')->assertJsonPath('data.0.name', 'Alfa');
    }

    public function test_user_can_create_style_with_controlled_tags(): void
    {
        $user = User::factory()->create();
        $tag = Tag::make(['name' => 'Design']);
        $tag->user_id = $user->id;
        $tag->save();
        Sanctum::actingAs($user);

        $this->postJson('/api/styles', ['name' => 'Art Déco', 'tags' => [$tag->slug]])
            ->assertCreated()
            ->assertJsonPath('data.slug', 'art-deco')
            ->assertJsonPath('data.tags.0.slug', 'design');

        $this->assertDatabaseHas('styles', ['slug' => 'art-deco', 'user_id' => $user->id]);
    }

    public function test_unknown_tags_are_rejected(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/styles', ['name' => 'X', 'tags' => ['nao-existe']])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('tags.0');
        $this->assertDatabaseCount('tags', 0);
    }

    public function test_other_users_styles_do_not_exist_for_the_current_user(): void
    {
        $style = Style::factory()->create();
        Sanctum::actingAs(User::factory()->create());

        $this->getJson("/api/styles/{$style->slug}")->assertNotFound();
        $this->putJson("/api/styles/{$style->slug}", ['name' => 'Hack'])->assertNotFound();
        $this->deleteJson("/api/styles/{$style->slug}")->assertNotFound();
        $this->getJson('/api/styles')->assertJsonCount(0, 'data');
        $this->assertModelExists($style);
    }

    public function test_owner_can_update_and_delete_style(): void
    {
        $style = Style::factory()->create();
        Sanctum::actingAs($style->owner);

        $this->putJson("/api/styles/{$style->slug}", ['name' => 'Renomeado'])->assertOk()->assertJsonPath('data.name', 'Renomeado');
        $this->deleteJson("/api/styles/{$style->slug}")->assertNoContent();
        $this->assertModelMissing($style);
    }

    public function test_cover_can_be_uploaded_replaced_and_removed(): void
    {
        Storage::fake('public');
        $style = Style::factory()->create(['cover_url' => 'https://example.com/url.jpg']);
        Sanctum::actingAs($style->owner);

        $first = $this->post("/api/styles/{$style->slug}", [
            '_method' => 'PUT',
            'name' => $style->name,
            'image' => UploadedFile::fake()->image('a.jpg'),
        ], ['Accept' => 'application/json'])->assertOk()->assertJsonPath('data.has_uploaded_image', true);

        $firstPath = $style->fresh()->image_path;
        Storage::disk('public')->assertExists($firstPath);
        $this->assertStringContainsString($firstPath, $first->json('data.cover_url'));

        $this->post("/api/styles/{$style->slug}", [
            '_method' => 'PUT',
            'name' => $style->name,
            'image' => UploadedFile::fake()->image('b.jpg'),
        ], ['Accept' => 'application/json'])->assertOk();
        Storage::disk('public')->assertMissing($firstPath);

        $this->post("/api/styles/{$style->slug}", [
            '_method' => 'PUT',
            'name' => $style->name,
            'remove_image' => true,
        ], ['Accept' => 'application/json'])
            ->assertOk()
            ->assertJsonPath('data.has_uploaded_image', false)
            ->assertJsonPath('data.cover_url', 'https://example.com/url.jpg');
        $this->assertEmpty(Storage::disk('public')->allFiles());
    }

    public function test_non_image_cover_is_rejected(): void
    {
        Storage::fake('public');
        Sanctum::actingAs(User::factory()->create());

        $this->post('/api/styles', [
            'name' => 'X',
            'image' => UploadedFile::fake()->create('x.php', 10, 'application/x-php'),
        ], ['Accept' => 'application/json'])->assertUnprocessable()->assertJsonValidationErrors('image');
    }

    public function test_person_photo_is_deleted_with_person(): void
    {
        Storage::fake('public');
        Sanctum::actingAs(User::factory()->create());

        $slug = $this->post('/api/people', [
            'name' => 'Ana',
            'image' => UploadedFile::fake()->image('a.jpg'),
        ], ['Accept' => 'application/json'])->assertCreated()->json('data.slug');

        $this->assertCount(1, Storage::disk('public')->allFiles());
        $this->deleteJson("/api/people/{$slug}")->assertNoContent();
        $this->assertEmpty(Storage::disk('public')->allFiles());
    }

    public function test_style_detail_lists_related_styles_by_shared_tags(): void
    {
        $user = User::factory()->create();
        $design = $this->tagFor($user, 'Design');
        $arte = $this->tagFor($user, 'Arte');
        $cor = $this->tagFor($user, 'Cor');
        $make = fn (string $name) => Style::factory()->for($user, 'owner')->create(['name' => $name]);
        $main = $make('Principal');
        $main->tags()->attach([$design->id, $arte->id]);
        $both = $make('Dois em comum');
        $both->tags()->attach([$design->id, $arte->id]);
        $one = $make('Um em comum');
        $one->tags()->attach([$design->id]);
        $none = $make('Sem relação');
        $none->tags()->attach([$cor->id]);
        Sanctum::actingAs($user);

        $response = $this->getJson("/api/styles/{$main->slug}")->assertOk();

        $this->assertSame(['Dois em comum', 'Um em comum'], collect($response->json('data.related'))->pluck('name')->all());
    }

    public function test_style_without_tags_has_no_related_styles(): void
    {
        $user = User::factory()->create();
        $style = Style::factory()->for($user, 'owner')->create();
        Style::factory()->for($user, 'owner')->create();
        Sanctum::actingAs($user);

        $this->getJson("/api/styles/{$style->slug}")->assertJsonCount(0, 'data.related');
    }

    public function test_style_detail_returns_limited_previews_with_total_counts(): void
    {
        $owner = User::factory()->create();
        $style = Style::factory()->for($owner, 'owner')->create();
        foreach (range(1, 10) as $number) {
            $style->references()->attach($owner->referenceItems()->create(['title' => "Ref {$number}", 'image_url' => 'https://example.com/a.jpg']));
        }
        foreach (Person::factory()->for($owner, 'owner')->count(8)->create() as $person) {
            $person->styles()->attach($style);
        }
        foreach (Strategy::factory()->for($owner, 'owner')->count(7)->create() as $strategy) {
            $strategy->styles()->attach($style);
        }
        Sanctum::actingAs($owner);

        $this->getJson("/api/styles/{$style->slug}")
            ->assertOk()
            ->assertJsonCount(8, 'data.references')
            ->assertJsonPath('data.references_count', 10)
            ->assertJsonCount(6, 'data.people')
            ->assertJsonPath('data.people_count', 8)
            ->assertJsonCount(5, 'data.strategies')
            ->assertJsonPath('data.strategies_count', 7);
    }

    public function test_people_and_strategies_can_be_filtered_by_style(): void
    {
        $user = User::factory()->create();
        $style = Style::factory()->for($user, 'owner')->create();
        $inside = Person::factory()->for($user, 'owner')->create();
        $inside->styles()->attach($style);
        Person::factory()->for($user, 'owner')->create();
        $strategy = Strategy::factory()->for($user, 'owner')->create();
        $strategy->styles()->attach($style);
        Strategy::factory()->for($user, 'owner')->create();
        Sanctum::actingAs($user);

        $this->getJson("/api/people?style={$style->slug}")->assertJsonPath('meta.total', 1)->assertJsonPath('data.0.slug', $inside->slug);
        $this->getJson("/api/strategies?style={$style->slug}")->assertJsonPath('meta.total', 1)->assertJsonPath('data.0.slug', $strategy->slug);
        $this->getJson('/api/people?style=nao-existe')->assertJsonPath('meta.total', 0);
    }
}
