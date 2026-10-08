<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reference_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->string('image_url', 2048)->nullable();
            $table->string('image_path')->nullable();
            $table->string('source_url', 2048)->nullable();
            $table->string('credit')->nullable();
            $table->string('description', 1000)->nullable();
            $table->timestamps();
        });

        Schema::create('referenceables', function (Blueprint $table) {
            $table->foreignId('reference_item_id')->constrained()->cascadeOnDelete();
            $table->morphs('referenceable');
            $table->primary(['reference_item_id', 'referenceable_type', 'referenceable_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('referenceables');
        Schema::dropIfExists('reference_items');
    }
};
