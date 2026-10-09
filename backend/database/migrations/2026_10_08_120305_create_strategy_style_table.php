<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('strategy_style', function (Blueprint $table) {
            $table->foreignId('strategy_id')->constrained()->cascadeOnDelete();
            $table->foreignId('style_id')->constrained()->cascadeOnDelete();
            $table->primary(['strategy_id', 'style_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('strategy_style');
    }
};
