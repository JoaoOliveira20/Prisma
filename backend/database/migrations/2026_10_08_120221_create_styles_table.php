<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('styles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('summary', 500)->nullable();
            $table->longText('history')->nullable();
            $table->text('influences')->nullable();
            $table->json('characteristics')->nullable();
            $table->string('period')->nullable();
            $table->string('origin')->nullable();
            $table->string('cover_url', 2048)->nullable();
            $table->string('image_path')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('styles');
    }
};
