<?php

namespace Database\Seeders\Concerns;

use Illuminate\Support\Facades\Storage;

trait CopiesSeedImages
{
    protected function copySeedImage(string $name, string $directory): ?string
    {
        $source = database_path("seeders/images/{$name}.svg");

        if (! is_file($source)) {
            return null;
        }

        $path = "{$directory}/seed-{$name}.svg";
        Storage::disk('public')->put($path, file_get_contents($source));

        return $path;
    }
}
