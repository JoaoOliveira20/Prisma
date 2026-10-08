<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class PersonFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'name' => fake()->unique()->name(),
            'role' => fake()->jobTitle(),
            'summary' => fake()->sentence(),
            'biography' => fake()->paragraphs(2, true),
        ];
    }
}
