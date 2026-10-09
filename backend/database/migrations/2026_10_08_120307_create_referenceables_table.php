<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('referenceables', function (Blueprint $table) {
            $table->foreignId('reference_item_id')->constrained()->cascadeOnDelete();
            $table->morphs('referenceable');
            $table->primary(['reference_item_id', 'referenceable_type', 'referenceable_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('referenceables');
    }
};
