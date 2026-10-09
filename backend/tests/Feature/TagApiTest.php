<?php

namespace Tests\Feature;

use App\Models\Style;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TagApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_tag_and_becomes_its_owner(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->postJson('/api/tags', ['name' => 'Surrealismo'])
            ->assertCreated()
            ->assertJsonPath('data.slug', 'surrealismo')
            ->assertJsonPath('data.can.update', true)
            ->assertJsonPath('data.usage_count', 0);

        $this->assertDatabaseHas('tags', ['slug' => 'surrealismo', 'user_id' => $user->id]);
    }

    public function test_duplicate_or_empty_names_are_rejected_only_within_the_same_account(): void
    {
        $user = User::factory()->create();
        $this->tagFor($user, 'Design');
        $this->tagFor(User::factory()->create(), 'Arte');
        Sanctum::actingAs($user);

        $this->postJson('/api/tags', ['name' => 'Design'])->assertUnprocessable()->assertJsonValidationErrors('name');
        $this->postJson('/api/tags', ['name' => ''])->assertUnprocessable()->assertJsonValidationErrors('name');
        $this->postJson('/api/tags', ['name' => str_repeat('a', 41)])->assertUnprocessable();
        $this->postJson('/api/tags', ['name' => 'Arte'])->assertCreated()->assertJsonPath('data.slug', 'arte');
    }

    public function test_listing_shows_only_own_tags_with_usage(): void
    {
        $user = User::factory()->create();
        $mine = $this->tagFor($user, 'Minha');
        $this->tagFor(User::factory()->create(), 'De outra pessoa');
        $style = Style::factory()->for($user, 'owner')->create();
        $style->tags()->attach($mine);
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/tags')->assertOk()->assertJsonCount(1, 'data');
        $this->assertSame(1, $response->json('data.0.usage_count'));
        $this->assertTrue($response->json('data.0.can.update'));
        $this->getJson('/api/tags?q=outra')->assertJsonCount(0, 'data');
    }

    public function test_other_accounts_tags_cannot_be_renamed_or_deleted_and_own_can(): void
    {
        $owner = User::factory()->create();
        $tag = $this->tagFor($owner, 'Dono');

        Sanctum::actingAs(User::factory()->create());
        $this->putJson("/api/tags/{$tag->slug}", ['name' => 'Hack'])->assertNotFound();
        $this->deleteJson("/api/tags/{$tag->slug}")->assertNotFound();

        Sanctum::actingAs($owner);
        $this->putJson("/api/tags/{$tag->slug}", ['name' => 'Novo Nome'])->assertOk()->assertJsonPath('data.name', 'Novo Nome')->assertJsonPath('data.slug', 'dono');
        $this->putJson("/api/tags/{$tag->slug}", ['name' => 'Novo Nome'])->assertOk();
        $this->deleteJson("/api/tags/{$tag->slug}")->assertNoContent();
    }

    public function test_tag_in_use_cannot_be_deleted(): void
    {
        $user = User::factory()->create();
        $tag = $this->tagFor($user, 'Usada');
        Style::factory()->for($user, 'owner')->create()->tags()->attach($tag);
        Sanctum::actingAs($user);

        $this->deleteJson("/api/tags/{$tag->slug}")
            ->assertStatus(409)
            ->assertJsonPath('message', 'Esta tag está em uso e não pode ser excluída.');
        $this->assertModelExists($tag);
    }
}
