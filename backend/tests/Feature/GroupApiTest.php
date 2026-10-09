<?php

namespace Tests\Feature;

use App\Models\Person;
use App\Models\Style;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class GroupApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_favorites_group_is_created_automatically_and_listed_first(): void
    {
        $user = User::factory()->create();
        $user->groups()->create(['name' => 'Aaa']);
        Sanctum::actingAs($user);

        $this->getJson('/api/groups')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.is_favorites', true)
            ->assertJsonPath('data.0.can.delete', false);
    }

    public function test_favoriting_adds_item_to_favorites_group(): void
    {
        $user = User::factory()->create();
        $style = Style::factory()->for($user, 'owner')->create();
        $person = Person::factory()->for($user, 'owner')->create();
        Sanctum::actingAs($user);

        $this->postJson("/api/favorites/style/{$style->slug}")->assertOk()->assertJsonPath('is_favorite', true);
        $this->postJson("/api/favorites/style/{$style->slug}")->assertOk();
        $this->postJson("/api/favorites/person/{$person->slug}")->assertOk();

        $this->assertDatabaseCount('group_items', 2);
        $this->getJson("/api/styles/{$style->slug}")->assertJsonPath('data.is_favorite', true);

        $favorites = $user->favoritesGroup();
        $this->getJson("/api/groups/{$favorites->id}")
            ->assertOk()
            ->assertJsonCount(1, 'data.styles')
            ->assertJsonCount(1, 'data.people')
            ->assertJsonPath('data.styles.0.is_favorite', true);

        $this->deleteJson("/api/favorites/style/{$style->slug}")->assertJsonPath('is_favorite', false);
        $this->assertDatabaseCount('group_items', 1);
    }

    public function test_user_can_create_rename_fill_and_delete_custom_group(): void
    {
        $user = User::factory()->create();
        $style = Style::factory()->for($user, 'owner')->create();
        Sanctum::actingAs($user);

        $id = $this->postJson('/api/groups', ['name' => 'Estudar depois'])->assertCreated()->json('data.id');
        $this->postJson('/api/groups', ['name' => 'Estudar depois'])->assertUnprocessable();
        $this->putJson("/api/groups/{$id}", ['name' => 'Estudar'])->assertOk()->assertJsonPath('data.name', 'Estudar');

        $this->postJson("/api/groups/{$id}/items", ['type' => 'style', 'slug' => $style->slug])->assertCreated();
        $this->getJson("/api/styles/{$style->slug}")->assertJsonPath('data.group_ids.0', $id);
        $this->getJson("/api/groups/{$id}")->assertJsonPath('data.items_count', 1);

        $this->deleteJson("/api/groups/{$id}/items/style/{$style->slug}")->assertOk();
        $this->deleteJson("/api/groups/{$id}")->assertNoContent();
    }

    public function test_favorites_group_cannot_be_renamed_or_deleted(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);
        $favorites = $user->favoritesGroup();

        $this->putJson("/api/groups/{$favorites->id}", ['name' => 'Outro'])->assertForbidden();
        $this->deleteJson("/api/groups/{$favorites->id}")->assertForbidden();
    }

    public function test_user_cannot_access_another_users_group(): void
    {
        $style = Style::factory()->create();
        $group = User::factory()->create()->groups()->create(['name' => 'Privado']);
        Sanctum::actingAs(User::factory()->create());

        $this->getJson("/api/groups/{$group->id}")->assertNotFound();
        $this->postJson("/api/groups/{$group->id}/items", ['type' => 'style', 'slug' => $style->slug])->assertNotFound();
        $this->deleteJson("/api/groups/{$group->id}")->assertNotFound();
    }

    public function test_deleting_content_removes_its_group_items_and_reference_links(): void
    {
        $style = Style::factory()->create();
        $reference = $style->owner->referenceItems()->create(['title' => 'R', 'image_url' => 'https://example.com/r.jpg']);
        $style->references()->attach($reference);
        Sanctum::actingAs($style->owner);

        $this->postJson("/api/favorites/style/{$style->slug}")->assertOk();
        $this->assertDatabaseCount('group_items', 1);
        $this->assertDatabaseCount('referenceables', 1);

        $this->deleteJson("/api/styles/{$style->slug}")->assertNoContent();

        $this->assertDatabaseCount('group_items', 0);
        $this->assertDatabaseCount('referenceables', 0);
        $this->assertDatabaseCount('reference_items', 1);
    }

    public function test_references_can_be_favorited_and_grouped(): void
    {
        $user = User::factory()->create();
        $reference = $user->referenceItems()->create(['title' => 'R', 'image_url' => 'https://example.com/r.jpg']);
        Sanctum::actingAs($user);
        $groupId = $this->postJson('/api/groups', ['name' => 'Moodboard'])->json('data.id');

        $this->postJson("/api/favorites/reference/{$reference->id}")->assertOk();
        $this->postJson("/api/groups/{$groupId}/items", ['type' => 'reference', 'slug' => (string) $reference->id])->assertCreated();

        $this->getJson('/api/references')
            ->assertJsonPath('data.0.is_favorite', true)
            ->assertJsonCount(2, 'data.0.group_ids');
        $this->getJson("/api/groups/{$groupId}")->assertJsonCount(1, 'data.references')->assertJsonPath('data.items_count', 1);

        $reference->delete();
        $this->assertDatabaseCount('group_items', 0);
    }

    public function test_related_items_and_references_inside_detail_carry_the_users_state(): void
    {
        $user = User::factory()->create();
        $style = Style::factory()->for($user, 'owner')->create();
        $person = Person::factory()->for($user, 'owner')->create();
        $person->styles()->attach($style);
        $reference = $user->referenceItems()->create(['title' => 'R', 'image_url' => 'https://example.com/r.jpg']);
        $style->references()->attach($reference);
        Sanctum::actingAs($user);

        $this->postJson("/api/favorites/person/{$person->slug}")->assertOk();
        $this->postJson("/api/favorites/reference/{$reference->id}")->assertOk();

        $this->getJson("/api/styles/{$style->slug}")
            ->assertJsonPath('data.people.0.is_favorite', true)
            ->assertJsonPath('data.references.0.is_favorite', true)
            ->assertJsonCount(1, 'data.references.0.group_ids')
            ->assertJsonPath('data.references.0.links.0.slug', $style->slug);

        $this->getJson("/api/people/{$person->slug}")->assertJsonPath('data.styles.0.is_favorite', false);
        $this->postJson("/api/favorites/style/{$style->slug}")->assertOk();
        $this->getJson("/api/people/{$person->slug}")->assertJsonPath('data.styles.0.is_favorite', true);
    }

    public function test_favorites_group_is_created_only_once(): void
    {
        $user = User::factory()->create();

        $user->favoritesGroup();
        $user->favoritesGroup();

        $this->assertSame(1, $user->groups()->where('is_favorites', true)->count());
    }

    public function test_group_list_exposes_preview_images_of_its_items(): void
    {
        $user = User::factory()->create();
        $withCover = Style::factory()->for($user, 'owner')->create(['cover_url' => 'https://example.com/a.jpg']);
        $withoutImage = Style::factory()->for($user, 'owner')->create(['cover_url' => null]);
        $reference = $user->referenceItems()->create(['title' => 'R', 'image_url' => 'https://example.com/r.jpg']);
        Sanctum::actingAs($user);
        $group = $user->groups()->create(['name' => 'Coleção']);

        foreach ([['style', $withCover->slug], ['style', $withoutImage->slug], ['reference', (string) $reference->id]] as [$type, $slug]) {
            $this->postJson("/api/groups/{$group->id}/items", ['type' => $type, 'slug' => $slug])->assertCreated();
        }

        $previews = collect($this->getJson('/api/groups')->json('data'))->firstWhere('name', 'Coleção')['previews'];

        $this->assertEqualsCanonicalizing(['https://example.com/a.jpg', 'https://example.com/r.jpg'], $previews);
    }
}
