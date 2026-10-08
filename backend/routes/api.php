<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\FavoriteController;
use App\Http\Controllers\Api\GroupController;
use App\Http\Controllers\Api\GroupItemController;
use App\Http\Controllers\Api\ImageController;
use App\Http\Controllers\Api\PersonController;
use App\Http\Controllers\Api\ReferenceItemController;
use App\Http\Controllers\Api\ReferenceLinkController;
use App\Http\Controllers\Api\StrategyController;
use App\Http\Controllers\Api\StyleController;
use App\Http\Controllers\Api\TagController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register'])->middleware('throttle:auth');
    Route::post('login', [AuthController::class, 'login'])->middleware('throttle:auth');
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('auth/me', [AuthController::class, 'me']);
    Route::post('auth/logout', [AuthController::class, 'logout']);

    Route::apiResource('tags', TagController::class)->except('show');

    Route::apiResource('styles', StyleController::class);

    Route::apiResource('people', PersonController::class)->parameters(['people' => 'person']);
    Route::apiResource('strategies', StrategyController::class)->parameters(['strategies' => 'strategy']);

    Route::get('images', [ImageController::class, 'index']);
    Route::apiResource('references', ReferenceItemController::class)->only(['index', 'show', 'store', 'update', 'destroy'])->parameters(['references' => 'referenceItem']);

    Route::post('references/{referenceItem}/links', [ReferenceLinkController::class, 'store']);
    Route::delete('references/{referenceItem}/links/{type}/{slug}', [ReferenceLinkController::class, 'destroy']);

    Route::apiResource('groups', GroupController::class);
    Route::post('groups/{group}/items', [GroupItemController::class, 'store']);
    Route::delete('groups/{group}/items/{type}/{slug}', [GroupItemController::class, 'destroy']);

    Route::post('favorites/{type}/{slug}', [FavoriteController::class, 'store']);
    Route::delete('favorites/{type}/{slug}', [FavoriteController::class, 'destroy']);
});
