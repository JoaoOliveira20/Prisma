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
        $this->getJson('/api/references?type=style&slug='.Style::factory()->create()->slug)->assertJsonCount(0, 'data');
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
        ])->assertForbidden();
        $this->assertDatabaseCount('reference_items', 0);
    }

    public function test_only_owner_can_delete_reference(): void
    {
        $reference = User::factory()->create()->referenceItems()->create([
            'title' => 'X',
            'image_url' => 'https://example.com/x.jpg',
        ]);
        Sanctum::actingAs(User::factory()->create());

        $this->deleteJson("/api/references/{$reference->id}")->assertForbidden();
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

        $this->putJson("/api/references/{$reference->id}", ['title' => 'Hack'])->assertForbidden();
    }
}
