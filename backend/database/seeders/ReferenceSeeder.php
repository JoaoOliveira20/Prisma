<?php

namespace Database\Seeders;

use App\Models\ReferenceItem;
use App\Models\Style;
use App\Models\User;
use Database\Seeders\Concerns\CopiesSeedImages;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ReferenceSeeder extends Seeder
{
    use CopiesSeedImages;

    public function run(): void
    {
        $owner = User::where('email', 'demo@prisma.test')->firstOrFail();

        foreach (Style::where('user_id', $owner->id)->get() as $style) {
            $title = "Composição: {$style->name}";

            if (ReferenceItem::where('title', $title)->exists()) {
                continue;
            }

            $path = $this->copySeedImage(Str::slug($style->name), 'references');

            if ($path === null) {
                continue;
            }

            $reference = $owner->referenceItems()->create([
                'title' => $title,
                'credit' => 'Arte original de demonstração do Prisma',
                'description' => "Composição abstrata criada para ilustrar o estilo {$style->name}.",
            ]);
            $reference->forceFill(['image_path' => $path])->save();
            $style->references()->attach($reference);
            $reference->tags()->sync($style->tags()->pluck('tags.id'));
        }
    }
}
