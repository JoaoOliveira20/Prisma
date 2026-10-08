<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('person_style', function (Blueprint $table) {
            $table->foreignId('person_id')->constrained()->cascadeOnDelete();
            $table->foreignId('style_id')->constrained()->cascadeOnDelete();
            $table->primary(['person_id', 'style_id']);
        });

        Schema::create('strategy_style', function (Blueprint $table) {
            $table->foreignId('strategy_id')->constrained()->cascadeOnDelete();
            $table->foreignId('style_id')->constrained()->cascadeOnDelete();
            $table->primary(['strategy_id', 'style_id']);
        });

        Schema::create('person_tag', function (Blueprint $table) {
            $table->foreignId('person_id')->constrained()->cascadeOnDelete();
            $table->foreignId('tag_id')->constrained()->cascadeOnDelete();
            $table->primary(['person_id', 'tag_id']);
        });

        Schema::create('strategy_tag', function (Blueprint $table) {
            $table->foreignId('strategy_id')->constrained()->cascadeOnDelete();
            $table->foreignId('tag_id')->constrained()->cascadeOnDelete();
            $table->primary(['strategy_id', 'tag_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('strategy_tag');
        Schema::dropIfExists('person_tag');
        Schema::dropIfExists('strategy_style');
        Schema::dropIfExists('person_style');
    }
};
