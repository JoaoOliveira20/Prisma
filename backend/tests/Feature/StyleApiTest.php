<?php

namespace Tests\Feature;

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
        Style::factory()->create(['name' => 'Bauhaus']);
        Style::factory()->create(['name' => 'Vaporwave']);
        Sanctum::actingAs(User::factory()->create());

        $this->getJson('/api/styles')->assertOk()->assertJsonCount(2, 'data');
        $this->getJson('/api/styles?q=bau')->assertOk()->assertJsonCount(1, 'data');
    }

    public function test_styles_can_be_sorted_by_most_recent(): void
    {
        Style::factory()->create(['name' => 'Alfa']);
        Style::factory()->create(['name' => 'Zeta']);
        Sanctum::actingAs(User::factory()->create());

        $this->getJson('/api/styles?sort=recent')->assertJsonPath('data.0.name', 'Zeta');
        $this->getJson('/api/styles')->assertJsonPath('data.0.name', 'Alfa');
    }

    public function test_user_can_create_style_with_controlled_tags(): void
    {
        $tag = Tag::create(['name' => 'Design', 'slug' => 'design']);
        $user = User::factory()->create();
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

    public function test_only_owner_can_update_or_delete_style(): void
    {
        $style = Style::factory()->create();
        Sanctum::actingAs(User::factory()->create());

        $this->putJson("/api/styles/{$style->slug}", ['name' => 'Hack'])->assertForbidden();
        $this->deleteJson("/api/styles/{$style->slug}")->assertForbidden();
        $this->getJson("/api/styles/{$style->slug}")->assertOk()->assertJsonPath('data.can.update', false);
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
}
