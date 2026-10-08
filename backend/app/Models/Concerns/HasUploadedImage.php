<?php

namespace App\Models\Concerns;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\File;

trait HasUploadedImage
{
    abstract public function imageUrlColumn(): string;

    protected static function bootHasUploadedImage(): void
    {
        static::deleted(fn ($model) => $model->deleteUploadedFile());
    }

    public static function imageRules(): array
    {
        return [
            'image' => ['nullable', File::image(allowSvg: false)->max(5 * 1024)],
            'remove_image' => ['nullable', 'boolean'],
        ];
    }

    public function displayImageUrl(): ?string
    {
        return $this->image_path
            ? Storage::disk('public')->url($this->image_path)
            : $this->{$this->imageUrlColumn()};
    }

    public function applyImageChanges(Request $request): void
    {
        if ($request->hasFile('image')) {
            $this->deleteUploadedFile();
            $this->forceFill(['image_path' => $request->file('image')->store('images', 'public')])->save();
        } elseif ($request->boolean('remove_image')) {
            $this->deleteUploadedFile();
            $this->forceFill(['image_path' => null])->save();
        }
    }

    private function deleteUploadedFile(): void
    {
        if ($this->image_path) {
            Storage::disk('public')->delete($this->image_path);
        }
    }
}
