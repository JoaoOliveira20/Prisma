<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\FavoriteController;
use App\Http\Controllers\Api\GroupController;
use App\Http\Controllers\Api\GroupItemController;
use App\Http\Controllers\Api\ImageController;
use App\Http\Controllers\Api\PersonController;
use App\Http\Controllers\Api\ReferenceBulkLinkController;
use App\Http\Controllers\Api\ReferenceItemController;
use App\Http\Controllers\Api\ReferenceLinkController;
use App\Http\Controllers\Api\StrategyController;
use App\Http\Controllers\Api\StyleController;
use App\Http\Controllers\Api\TagController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->middleware('throttle:auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('auth')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/refresh', [AuthController::class, 'refresh']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });

    Route::prefix('tags')->name('tags.')->group(function () {
        Route::get('/', [TagController::class, 'index'])->name('index');
        Route::post('/', [TagController::class, 'store'])->name('store');
        Route::put('/{tag}', [TagController::class, 'update'])->name('update');
        Route::delete('/{tag}', [TagController::class, 'destroy'])->name('destroy');
    });

    Route::prefix('styles')->group(function () {
        Route::get('/', [StyleController::class, 'index']);
        Route::post('/', [StyleController::class, 'store']);
        Route::get('/{style}', [StyleController::class, 'show']);
        Route::put('/{style}', [StyleController::class, 'update']);
        Route::delete('/{style}', [StyleController::class, 'destroy']);
    });

    Route::prefix('people')->group(function () {
        Route::get('/', [PersonController::class, 'index']);
        Route::post('/', [PersonController::class, 'store']);
        Route::get('/{person}', [PersonController::class, 'show']);
        Route::put('/{person}', [PersonController::class, 'update']);
        Route::delete('/{person}', [PersonController::class, 'destroy']);
    });

    Route::prefix('strategies')->group(function () {
        Route::get('/', [StrategyController::class, 'index']);
        Route::post('/', [StrategyController::class, 'store']);
        Route::get('/{strategy}', [StrategyController::class, 'show']);
        Route::put('/{strategy}', [StrategyController::class, 'update']);
        Route::delete('/{strategy}', [StrategyController::class, 'destroy']);
    });

    Route::prefix('references')->group(function () {
        Route::get('/', [ReferenceItemController::class, 'index']);
        Route::post('/', [ReferenceItemController::class, 'store']);
        Route::post('/links', [ReferenceBulkLinkController::class, 'store']);
        Route::get('/{referenceItem}', [ReferenceItemController::class, 'show']);
        Route::put('/{referenceItem}', [ReferenceItemController::class, 'update']);
        Route::delete('/{referenceItem}', [ReferenceItemController::class, 'destroy']);
        Route::post('/{referenceItem}/links', [ReferenceLinkController::class, 'store']);
        Route::delete('/{referenceItem}/links/{type}/{slug}', [ReferenceLinkController::class, 'destroy']);
    });

    Route::prefix('images')->group(function () {
        Route::get('/', [ImageController::class, 'index']);
    });

    Route::prefix('groups')->group(function () {
        Route::get('/', [GroupController::class, 'index']);
        Route::post('/', [GroupController::class, 'store']);
        Route::get('/{group}', [GroupController::class, 'show']);
        Route::put('/{group}', [GroupController::class, 'update']);
        Route::delete('/{group}', [GroupController::class, 'destroy']);
        Route::post('/{group}/items', [GroupItemController::class, 'store']);
        Route::delete('/{group}/items/{type}/{slug}', [GroupItemController::class, 'destroy']);
    });

    Route::prefix('favorites')->group(function () {
        Route::post('/{type}/{slug}', [FavoriteController::class, 'store']);
        Route::delete('/{type}/{slug}', [FavoriteController::class, 'destroy']);
    });
});
