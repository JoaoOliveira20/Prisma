<?php

namespace App\Models;

use App\Models\Concerns\Groupable;
use App\Models\Concerns\HasReferences;
use App\Models\Concerns\HasUniqueSlug;
use App\Models\Concerns\HasUploadedImage;
use App\Models\Concerns\Searchable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

#[Fillable(['name', 'category', 'summary', 'description', 'cover_url'])]
class Strategy extends Model
{
    use Groupable, HasFactory, HasReferences, HasUniqueSlug, HasUploadedImage, Searchable;

    public function imageUrlColumn(): string
    {
        return 'cover_url';
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class);
    }

    public function styles(): BelongsToMany
    {
        return $this->belongsToMany(Style::class)->orderBy('styles.name');
    }
}
