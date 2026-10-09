<?php

namespace App\Models;

use App\Models\Concerns\Groupable;
use App\Models\Concerns\HasReferences;
use App\Models\Concerns\HasUniqueSlug;
use App\Models\Concerns\HasUploadedImage;
use App\Models\Concerns\OwnedByUser;
use App\Models\Concerns\Searchable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

#[Fillable(['name', 'summary', 'history', 'influences', 'characteristics', 'period', 'origin', 'cover_url'])]
class Style extends Model
{
    use Groupable, HasFactory, HasReferences, HasUniqueSlug, HasUploadedImage, OwnedByUser, Searchable;

    protected function casts(): array
    {
        return ['characteristics' => 'array'];
    }

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

    public function people(): BelongsToMany
    {
        return $this->belongsToMany(Person::class)->orderBy('people.name');
    }

    public function strategies(): BelongsToMany
    {
        return $this->belongsToMany(Strategy::class)->orderBy('strategies.name');
    }
}
