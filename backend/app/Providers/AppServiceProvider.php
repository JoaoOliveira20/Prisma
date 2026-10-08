<?php

namespace App\Providers;

use App\Models\Person;
use App\Models\ReferenceItem;
use App\Models\Strategy;
use App\Models\Style;
use App\Models\User;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        RateLimiter::for('api', fn (Request $request) => Limit::perMinute(240)->by($request->user()?->id ?: $request->ip()));

        RateLimiter::for('auth', fn (Request $request) => Limit::perMinute((int) env('AUTH_RATE_LIMIT', 10))->by($request->ip()));

        Relation::enforceMorphMap([
            'style' => Style::class,
            'person' => Person::class,
            'strategy' => Strategy::class,
            'reference' => ReferenceItem::class,
            'user' => User::class,
        ]);
    }
}
