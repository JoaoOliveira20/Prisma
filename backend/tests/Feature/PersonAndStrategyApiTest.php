<?php

namespace Tests\Feature;

use App\Models\Person;
use App\Models\Strategy;
use App\Models\Style;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PersonAndStrategyApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_person_linked_to_styles(): void
    {
        $style = Style::factory()->create();
        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/people', ['name' => 'Anni Albers', 'styles' => [$style->slug]])
            ->assertCreated()
            ->assertJsonPath('data.slug', 'anni-albers')
            ->assertJsonPath('data.styles.0.slug', $style->slug);

        $this->getJson("/api/styles/{$style->slug}")->assertJsonPath('data.people.0.name', 'Anni Albers');
    }

    public function test_person_rejects_unknown_style_and_tag(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/people', ['name' => 'X', 'styles' => ['nao-existe'], 'tags' => ['nao-existe']])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['styles.0', 'tags.0']);
    }

    public function test_only_owner_can_change_person(): void
    {
        $person = Person::factory()->create();
        Sanctum::actingAs(User::factory()->create());

        $this->putJson("/api/people/{$person->slug}", ['name' => 'Hack'])->assertForbidden();
        $this->deleteJson("/api/people/{$person->slug}")->assertForbidden();

        Sanctum::actingAs($person->owner);
        $this->putJson("/api/people/{$person->slug}", ['name' => 'Novo Nome'])->assertOk();
        $this->deleteJson("/api/people/{$person->slug}")->assertNoContent();
    }

    public function test_strategy_crud_and_ownership(): void
    {
        $strategy = Strategy::factory()->create();
        Sanctum::actingAs(User::factory()->create());

        $this->getJson('/api/strategies')->assertOk()->assertJsonCount(1, 'data');
        $this->postJson('/api/strategies', ['name' => 'Grade modular'])->assertCreated();
        $this->putJson("/api/strategies/{$strategy->slug}", ['name' => 'Hack'])->assertForbidden();
        $this->deleteJson("/api/strategies/{$strategy->slug}")->assertForbidden();
    }

    public function test_search_filters_people(): void
    {
        Person::factory()->create(['name' => 'Dieter Rams']);
        Person::factory()->create(['name' => 'Paula Scher']);
        Sanctum::actingAs(User::factory()->create());

        $this->getJson('/api/people?q=rams')->assertJsonCount(1, 'data');
    }

    public function test_search_matches_secondary_fields(): void
    {
        Style::factory()->create(['name' => 'Alfa', 'period' => '1919 - 1933', 'origin' => 'Alemanha']);
        Style::factory()->create(['name' => 'Beta', 'period' => '2000', 'origin' => 'Japão']);
        Person::factory()->create(['name' => 'Gama', 'role' => 'Arquiteta']);
        Strategy::factory()->create(['name' => 'Delta', 'category' => 'Metodologia']);
        Sanctum::actingAs(User::factory()->create());

        $this->getJson('/api/styles?q=1919')->assertJsonCount(1, 'data')->assertJsonPath('data.0.name', 'Alfa');
        $this->getJson('/api/styles?q=Jap')->assertJsonCount(1, 'data')->assertJsonPath('data.0.name', 'Beta');
        $this->getJson('/api/people?q=Arquiteta')->assertJsonCount(1, 'data');
        $this->getJson('/api/strategies?q=Metodologia')->assertJsonCount(1, 'data');
    }

    public function test_groups_can_be_searched_by_name(): void
    {
        $user = User::factory()->create();
        $user->groups()->create(['name' => 'Moodboard']);
        $user->groups()->create(['name' => 'Estudos']);
        Sanctum::actingAs($user);

        $this->getJson('/api/groups?q=mood')->assertJsonCount(1, 'data');
    }

    public function test_search_treats_wildcards_literally(): void
    {
        Person::factory()->create(['name' => 'Ana 100%']);
        Person::factory()->create(['name' => 'Bruno']);
        Sanctum::actingAs(User::factory()->create());

        $this->getJson('/api/people?q=%25')->assertJsonCount(1, 'data')->assertJsonPath('data.0.name', 'Ana 100%');
        $this->getJson('/api/people?q=_')->assertJsonCount(0, 'data');
    }
}
