<?php

namespace Tests\Feature;

use App\Models\Style;
use App\Models\Tag;
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

    public function test_duplicate_or_empty_names_are_rejected(): void
    {
        Tag::create(['name' => 'Design']);
        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/tags', ['name' => 'Design'])->assertUnprocessable()->assertJsonValidationErrors('name');
        $this->postJson('/api/tags', ['name' => ''])->assertUnprocessable()->assertJsonValidationErrors('name');
        $this->postJson('/api/tags', ['name' => str_repeat('a', 41)])->assertUnprocessable();
    }

    public function test_listing_shows_usage_and_permissions(): void
    {
        $user = User::factory()->create();
        $mine = Tag::make(['name' => 'Minha']);
        $mine->user_id = $user->id;
        $mine->save();
        Tag::create(['name' => 'Sistema']);
        $style = Style::factory()->create();
        $style->tags()->attach($mine);
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/tags')->assertOk();
        $this->assertSame(1, collect($response->json('data'))->firstWhere('slug', 'minha')['usage_count']);
        $this->assertFalse(collect($response->json('data'))->firstWhere('slug', 'sistema')['can']['update']);
        $this->getJson('/api/tags?q=sist')->assertJsonCount(1, 'data');
    }

    public function test_only_owner_can_rename_and_delete_and_system_tags_are_locked(): void
    {
        $owner = User::factory()->create();
        $tag = Tag::make(['name' => 'Dono']);
        $tag->user_id = $owner->id;
        $tag->save();
        $system = Tag::create(['name' => 'Sistema']);

        Sanctum::actingAs(User::factory()->create());
        $this->putJson("/api/tags/{$tag->slug}", ['name' => 'Hack'])->assertForbidden();
        $this->deleteJson("/api/tags/{$tag->slug}")->assertForbidden();

        Sanctum::actingAs($owner);
        $this->putJson("/api/tags/{$system->slug}", ['name' => 'Hack'])->assertForbidden();
        $this->deleteJson("/api/tags/{$system->slug}")->assertForbidden();
        $this->putJson("/api/tags/{$tag->slug}", ['name' => 'Novo Nome'])->assertOk()->assertJsonPath('data.name', 'Novo Nome')->assertJsonPath('data.slug', 'dono');
        $this->putJson("/api/tags/{$tag->slug}", ['name' => 'Novo Nome'])->assertOk();
        $this->deleteJson("/api/tags/{$tag->slug}")->assertNoContent();
    }

    public function test_tag_in_use_cannot_be_deleted(): void
    {
        $user = User::factory()->create();
        $tag = Tag::make(['name' => 'Usada']);
        $tag->user_id = $user->id;
        $tag->save();
        Style::factory()->create()->tags()->attach($tag);
        Sanctum::actingAs($user);

        $this->deleteJson("/api/tags/{$tag->slug}")
            ->assertStatus(409)
            ->assertJsonPath('message', 'Esta tag está em uso e não pode ser excluída.');
        $this->assertModelExists($tag);
    }
}
