<?php

namespace Tests\Feature;

use App\Models\Person;
use App\Models\ReferenceItem;
use App\Models\Strategy;
use App\Models\Style;
use App\Models\Tag;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class SeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_seeding_is_idempotent_and_attaches_demo_images(): void
    {
        Storage::fake('public');

        $this->seed(DatabaseSeeder::class);
        $this->seed(DatabaseSeeder::class);

        $this->assertSame(12, Tag::count());
        $this->assertSame(5, Style::count());
        $this->assertSame(6, Person::count());
        $this->assertSame(5, Strategy::count());
        $this->assertSame(5, ReferenceItem::count());
        $this->assertSame(5, Style::whereNotNull('image_path')->count());
        $this->assertSame(5, Strategy::whereNotNull('image_path')->count());
        Storage::disk('public')->assertExists(Style::firstWhere('name', 'Bauhaus')->image_path);
        $this->assertSame(1, Style::firstWhere('name', 'Bauhaus')->references()->count());
        $this->assertNotNull(ReferenceItem::first()->description);
    }
}
