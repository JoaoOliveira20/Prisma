<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register_and_receive_token(): void
    {
        $this->postJson('/api/auth/register', [
            'name' => 'Ana',
            'email' => 'ana@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ])->assertCreated()->assertJsonStructure(['token', 'user' => ['name', 'email']]);
    }

    public function test_user_can_login_with_valid_credentials(): void
    {
        $user = User::factory()->create();

        $this->postJson('/api/auth/login', ['email' => $user->email, 'password' => 'password'])
            ->assertOk()
            ->assertJsonStructure(['token']);
    }

    public function test_login_fails_with_invalid_credentials(): void
    {
        $user = User::factory()->create();

        $this->postJson('/api/auth/login', ['email' => $user->email, 'password' => 'wrong'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('email');
    }

    public function test_guest_cannot_access_protected_routes(): void
    {
        $this->getJson('/api/styles')->assertUnauthorized();
    }

    public function test_error_messages_are_in_portuguese(): void
    {
        $user = User::factory()->create();

        $this->postJson('/api/auth/login', ['email' => $user->email, 'password' => 'wrong'])
            ->assertJsonPath('errors.email.0', 'E-mail ou senha incorretos.');
        $this->postJson('/api/auth/register', ['email' => 'x'])
            ->assertJsonPath('errors.name.0', 'O campo nome é obrigatório.')
            ->assertJsonPath('errors.email.0', 'O campo e-mail deve ser um e-mail válido.');
    }

    public function test_unauthenticated_and_forbidden_messages_are_in_portuguese(): void
    {
        $this->getJson('/api/styles')->assertUnauthorized()->assertJsonPath('message', 'Não autenticado.');

        $user = User::factory()->create();
        Sanctum::actingAs($user);
        $this->deleteJson("/api/groups/{$user->favoritesGroup()->id}")
            ->assertForbidden()
            ->assertJsonPath('message', 'Você não tem permissão para esta ação.');
    }

    public function test_tokens_last_one_day_and_login_reports_it(): void
    {
        $user = User::factory()->create(['password' => 'senha-segura-123']);

        $login = $this->postJson('/api/auth/login', ['email' => $user->email, 'password' => 'senha-segura-123'])
            ->assertOk()
            ->assertJsonPath('expires_in', 86400);
        $token = $login->json('token');

        $this->withToken($token)->getJson('/api/auth/me')->assertOk();

        $this->travel(23)->hours();
        app('auth')->forgetGuards();
        $this->withToken($token)->getJson('/api/auth/me')->assertOk();

        $this->travel(2)->hours();
        app('auth')->forgetGuards();
        $this->withToken($token)->getJson('/api/auth/me')->assertUnauthorized();
    }

    public function test_refresh_extends_the_current_token_only_while_it_is_valid(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('web', ['*'], now()->addDay())->plainTextToken;
        $other = $user->createToken('web', ['*'], now()->addDay())->plainTextToken;

        $this->travel(20)->hours();
        app('auth')->forgetGuards();
        $this->withToken($token)->postJson('/api/auth/refresh')->assertOk()->assertJsonPath('expires_in', 86400);

        $this->travel(20)->hours();
        app('auth')->forgetGuards();
        $this->withToken($token)->getJson('/api/auth/me')->assertOk();
        app('auth')->forgetGuards();
        $this->withToken($other)->getJson('/api/auth/me')->assertUnauthorized();

        $this->travel(5)->hours();
        app('auth')->forgetGuards();
        $this->withToken($token)->postJson('/api/auth/refresh')->assertUnauthorized();
    }

    public function test_refresh_requires_authentication(): void
    {
        $this->postJson('/api/auth/refresh')->assertUnauthorized();
    }

    public function test_login_is_rate_limited(): void
    {
        $user = User::factory()->create();

        foreach (range(1, 10) as $attempt) {
            $this->postJson('/api/auth/login', ['email' => $user->email, 'password' => 'wrong'])->assertUnprocessable();
        }

        $this->postJson('/api/auth/login', ['email' => $user->email, 'password' => 'wrong'])->assertStatus(429);
    }
}
