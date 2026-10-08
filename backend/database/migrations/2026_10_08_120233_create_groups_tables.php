<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('groups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->boolean('is_favorites')->default(false);
            $table->timestamps();
            $table->unique(['user_id', 'name']);
        });

        Schema::create('group_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('group_id')->constrained()->cascadeOnDelete();
            $table->morphs('groupable');
            $table->timestamps();
            $table->unique(['group_id', 'groupable_type', 'groupable_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('group_items');
        Schema::dropIfExists('groups');
    }
};
