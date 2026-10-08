<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Cache;
use Laravel\Sanctum\HasApiTokens;

#[Fillable(['name', 'email', 'password'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    public function styles(): HasMany
    {
        return $this->hasMany(Style::class);
    }

    public function referenceItems(): HasMany
    {
        return $this->hasMany(ReferenceItem::class);
    }

    public function people(): HasMany
    {
        return $this->hasMany(Person::class);
    }

    public function strategies(): HasMany
    {
        return $this->hasMany(Strategy::class);
    }

    public function groups(): HasMany
    {
        return $this->hasMany(Group::class);
    }

    public function favoritesGroup(): Group
    {
        return Cache::lock("favorites-group:{$this->id}", 5)->block(5, fn () => $this->groups()->where('is_favorites', true)->first()
            ?? $this->groups()->forceCreate(['name' => 'Favoritos', 'is_favorites' => true]));
    }

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}
