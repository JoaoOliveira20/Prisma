<?php

namespace Database\Seeders;

use App\Models\Tag;
use Illuminate\Database\Seeder;

class TagSeeder extends Seeder
{
    public function run(): void
    {
        $names = [
            'Design', 'Arte', 'Arquitetura', 'Moderno', 'Tipografia', 'Cor',
            'Digital', 'Cultura pop', 'Funcionalismo', 'Urbano', 'Retrô', 'Tecnologia',
        ];

        foreach ($names as $name) {
            Tag::firstOrCreate(['name' => $name]);
        }
    }
}
