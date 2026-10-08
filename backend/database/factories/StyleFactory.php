<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class StyleFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'name' => fake()->unique()->words(2, true),
            'summary' => fake()->sentence(),
            'history' => fake()->paragraphs(2, true),
            'period' => fake()->year().' - '.fake()->year(),
            'origin' => fake()->country(),
            'characteristics' => [fake()->word(), fake()->word()],
        ];
    }
}
