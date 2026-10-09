<?php

namespace Tests\Feature;

use App\Models\Person;
use App\Models\Strategy;
use App\Models\Style;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class DataIsolationApiTest extends TestCase
{
    use RefreshDatabase;

    private function fullAccount(string $suffix = ''): array
    {
        $user = User::factory()->create();
        $tag = $this->tagFor($user, "Tag{$suffix}");
        $style = Style::factory()->for($user, 'owner')->create(['name' => "Estilo{$suffix}"]);
        $style->tags()->attach($tag);
        $person = Person::factory()->for($user, 'owner')->create(['name' => "Pessoa{$suffix}"]);
        $strategy = Strategy::factory()->for($user, 'owner')->create(['name' => "Estratégia{$suffix}"]);
        $reference = $user->referenceItems()->create(['title' => "Referência{$suffix}", 'image_url' => 'https://example.com/a.jpg']);
        $style->references()->attach($reference);
        $group = $user->groups()->create(['name' => "Grupo{$suffix}"]);

        return compact('user', 'tag', 'style', 'person', 'strategy', 'reference', 'group');
    }

    public function test_a_new_account_starts_empty(): void
    {
        $this->fullAccount();
        Sanctum::actingAs(User::factory()->create());

        foreach (['styles', 'people', 'strategies', 'references', 'tags', 'images'] as $resource) {
            $this->getJson("/api/{$resource}")->assertOk()->assertJsonCount(0, 'data');
        }
        $this->getJson('/api/groups')->assertJsonCount(1, 'data')->assertJsonPath('data.0.is_favorites', true);
    }

    public function test_each_account_only_sees_its_own_records(): void
    {
        $first = $this->fullAccount('A');
        $second = $this->fullAccount('B');

        Sanctum::actingAs($first['user']);
        $this->getJson('/api/styles')->assertJsonCount(1, 'data')->assertJsonPath('data.0.name', 'EstiloA');
        $this->getJson('/api/people')->assertJsonCount(1, 'data')->assertJsonPath('data.0.name', 'PessoaA');
        $this->getJson('/api/strategies')->assertJsonCount(1, 'data');
        $this->getJson('/api/references')->assertJsonCount(1, 'data')->assertJsonPath('data.0.title', 'ReferênciaA');
        $this->getJson('/api/tags')->assertJsonCount(1, 'data')->assertJsonPath('data.0.name', 'TagA');
        $this->getJson('/api/images')->assertJsonPath('meta.total', 1);
        $this->getJson('/api/groups')->assertJsonCount(2, 'data');

        Sanctum::actingAs($second['user']);
        $this->getJson('/api/styles')->assertJsonCount(1, 'data')->assertJsonPath('data.0.name', 'EstiloB');
        $this->getJson('/api/tags')->assertJsonPath('data.0.name', 'TagB');
    }

    public function test_other_accounts_records_are_not_found_by_any_endpoint(): void
    {
        $other = $this->fullAccount('X');
        Sanctum::actingAs(User::factory()->create());

        $this->getJson("/api/styles/{$other['style']->slug}")->assertNotFound();
        $this->getJson("/api/people/{$other['person']->slug}")->assertNotFound();
        $this->getJson("/api/strategies/{$other['strategy']->slug}")->assertNotFound();
        $this->getJson("/api/references/{$other['reference']->id}")->assertNotFound();
        $this->getJson("/api/groups/{$other['group']->id}")->assertNotFound();
        $this->postJson("/api/favorites/style/{$other['style']->slug}")->assertNotFound();
        $this->postJson("/api/groups/{$other['group']->id}/items", ['type' => 'style', 'slug' => $other['style']->slug])->assertNotFound();
        $this->getJson("/api/images?style={$other['style']->slug}")->assertJsonPath('meta.total', 0);
        $this->getJson("/api/images?tag={$other['tag']->slug}")->assertJsonPath('meta.total', 0);
        $this->getJson("/api/images?group={$other['group']->id}")->assertJsonPath('meta.total', 0);
    }

    public function test_slugs_and_tag_names_repeat_across_accounts_without_collision(): void
    {
        $first = User::factory()->create();
        $second = User::factory()->create();

        foreach ([$first, $second] as $user) {
            Sanctum::actingAs($user);
            $this->postJson('/api/tags', ['name' => 'Arte'])->assertCreated()->assertJsonPath('data.slug', 'arte');
            $this->postJson('/api/styles', ['name' => 'Bauhaus', 'tags' => ['arte']])->assertCreated()->assertJsonPath('data.slug', 'bauhaus');
            $this->postJson('/api/people', ['name' => 'Gropius', 'styles' => ['bauhaus']])->assertCreated()->assertJsonPath('data.slug', 'gropius');
        }

        $this->postJson('/api/styles', ['name' => 'Bauhaus'])->assertCreated()->assertJsonPath('data.slug', 'bauhaus-2');
        $this->assertSame(1, Style::withoutGlobalScopes()->where('user_id', $first->id)->where('slug', 'bauhaus')->count());
        $this->assertSame(1, Style::withoutGlobalScopes()->where('user_id', $second->id)->where('slug', 'bauhaus')->count());
    }

    public function test_content_cannot_use_another_accounts_tags_or_styles(): void
    {
        $other = $this->fullAccount('Z');
        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/styles', ['name' => 'Meu', 'tags' => [$other['tag']->slug]])->assertUnprocessable()->assertJsonValidationErrors('tags.0');
        $this->postJson('/api/strategies', ['name' => 'Minha', 'styles' => [$other['style']->slug]])->assertUnprocessable()->assertJsonValidationErrors('styles.0');
        $this->postJson('/api/references', ['title' => 'R', 'image_url' => 'https://example.com/r.jpg', 'tags' => [$other['tag']->slug]])->assertUnprocessable();
    }

    public function test_search_endpoints_do_not_leak_other_accounts_records(): void
    {
        $this->fullAccount('Secreto');
        Sanctum::actingAs(User::factory()->create());

        $this->getJson('/api/styles?q=Secreto')->assertJsonCount(0, 'data');
        $this->getJson('/api/images?q=Secreto')->assertJsonPath('meta.total', 0);
        $this->getJson('/api/tags?q=Secreto')->assertJsonCount(0, 'data');
    }
}
