<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private const SLUGGED = ['styles', 'people', 'strategies'];

    public function up(): void
    {
        $fallbackOwner = DB::table('users')->where('email', 'demo@prisma.test')->value('id')
            ?? DB::table('users')->orderBy('id')->value('id');

        if ($fallbackOwner !== null) {
            DB::table('tags')->whereNull('user_id')->update(['user_id' => $fallbackOwner]);
        }

        foreach (self::SLUGGED as $table) {
            Schema::table($table, function (Blueprint $table_) use ($table) {
                $table_->dropUnique("{$table}_slug_unique");
                $table_->unique(['user_id', 'slug']);
            });
        }

        Schema::table('tags', function (Blueprint $table) {
            $table->dropUnique('tags_name_unique');
            $table->dropUnique('tags_slug_unique');
            $table->unique(['user_id', 'name']);
            $table->unique(['user_id', 'slug']);
        });
    }

    public function down(): void
    {
        Schema::table('tags', function (Blueprint $table) {
            $table->index('user_id');
            $table->dropUnique(['user_id', 'name']);
            $table->dropUnique(['user_id', 'slug']);
            $table->unique('name');
            $table->unique('slug');
        });

        foreach (self::SLUGGED as $table) {
            Schema::table($table, function (Blueprint $table_) {
                $table_->index('user_id');
                $table_->dropUnique(['user_id', 'slug']);
                $table_->unique('slug');
            });
        }
    }
};
