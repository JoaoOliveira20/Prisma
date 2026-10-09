<?php

namespace Database\Seeders;

use App\Models\Tag;
use App\Models\User;
use Illuminate\Database\Seeder;

class TagSeeder extends Seeder
{
    public function run(): void
    {
        $owner = User::firstOrCreate(
            ['email' => 'demo@prisma.test'],
            ['name' => 'Demo Prisma', 'password' => 'password']
        );

        $names = [
            'Design', 'Arte', 'Arquitetura', 'Moderno', 'Tipografia', 'Cor',
            'Digital', 'Cultura pop', 'Funcionalismo', 'Urbano', 'Retrô', 'Tecnologia',
        ];

        foreach ($names as $name) {
            Tag::firstOrCreate(['user_id' => $owner->id, 'name' => $name]);
        }
    }
}
