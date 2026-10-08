<?php

namespace Database\Seeders;

use App\Models\Person;
use App\Models\Style;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Database\Seeder;

class PersonSeeder extends Seeder
{
    public function run(): void
    {
        $owner = User::where('email', 'demo@prisma.test')->firstOrFail();

        $people = [
            [
                'name' => 'Walter Gropius',
                'role' => 'Arquiteto',
                'summary' => 'Fundador da Bauhaus e defensor da união entre arte, ofício e tecnologia.',
                'biography' => "Walter Gropius foi um arquiteto alemão que fundou a Bauhaus em Weimar, em 1919. Sob sua direção, a escola reuniu artistas, designers e arquitetos em torno da ideia de que o design deveria servir à vida moderna.\n\nApós a pressão do regime nazista, emigrou e lecionou em Harvard, onde influenciou gerações de arquitetos.",
                'period' => '1883 - 1969',
                'origin' => 'Alemanha',
                'tags' => ['arquitetura', 'design', 'moderno'],
                'styles' => ['Bauhaus'],
            ],
            [
                'name' => 'Le Corbusier',
                'role' => 'Arquiteto e urbanista',
                'summary' => 'Figura central da arquitetura moderna e inspiração do brutalismo.',
                'biography' => "Charles-Édouard Jeanneret, conhecido como Le Corbusier, nasceu na Suíça e construiu sua carreira na França. Formulou os cinco pontos da nova arquitetura e propôs ideias radicais para o urbanismo moderno.\n\nSuas obras tardias em concreto aparente, como a Unité d'Habitation, influenciaram diretamente o brutalismo.",
                'period' => '1887 - 1965',
                'origin' => 'Suíça e França',
                'tags' => ['arquitetura', 'moderno', 'urbano'],
                'styles' => ['Brutalismo'],
            ],
            [
                'name' => 'Dieter Rams',
                'role' => 'Designer industrial',
                'summary' => 'Designer da Braun e autor dos dez princípios do bom design.',
                'biography' => "Dieter Rams projetou produtos para a Braun e para a Vitsœ a partir dos anos 1950. Seu trabalho combina clareza, utilidade e discrição formal.\n\nEle formulou dez princípios do bom design, entre eles a ideia de que o bom design é o mínimo de design possível.",
                'period' => '1932 - atual',
                'origin' => 'Alemanha',
                'tags' => ['design', 'funcionalismo', 'moderno'],
                'styles' => ['Minimalismo'],
            ],
            [
                'name' => 'Massimo Vignelli',
                'role' => 'Designer gráfico',
                'summary' => 'Defensor do rigor tipográfico e dos sistemas de design consistentes.',
                'biography' => "Massimo Vignelli foi um designer italiano radicado nos Estados Unidos. Com Lella Vignelli, criou identidades visuais, sinalização e publicações baseadas em grades e em um repertório tipográfico enxuto.\n\nSeu mapa do metrô de Nova York de 1972 é um dos exemplos mais conhecidos de sua abordagem.",
                'period' => '1931 - 2014',
                'origin' => 'Itália e Estados Unidos',
                'tags' => ['design', 'tipografia', 'moderno'],
                'styles' => ['Minimalismo'],
            ],
            [
                'name' => 'Naoto Fukasawa',
                'role' => 'Designer de produto',
                'summary' => 'Designer japonês associado ao conceito de design sem pensamento.',
                'biography' => "Naoto Fukasawa é um designer japonês conhecido por objetos cotidianos que parecem naturais ao uso. Trabalhou com marcas como a Muji e fundou o Naoto Fukasawa Design.\n\nSua ideia de design sem pensamento propõe produtos que se encaixam no comportamento intuitivo das pessoas.",
                'period' => '1956 - atual',
                'origin' => 'Japão',
                'tags' => ['design', 'moderno'],
                'styles' => ['Minimalismo'],
            ],
            [
                'name' => 'Paula Scher',
                'role' => 'Designer gráfica',
                'summary' => 'Sócia da Pentagram, conhecida pela tipografia expressiva e por identidades marcantes.',
                'biography' => "Paula Scher é uma designer gráfica americana, sócia da Pentagram desde 1991. Seu trabalho explora a tipografia em grande escala, com cor e densidade, em identidades e ambientes.\n\nEla assina, entre outros, a identidade do Public Theater, em Nova York.",
                'period' => '1948 - atual',
                'origin' => 'Estados Unidos',
                'tags' => ['design', 'tipografia', 'cor'],
                'styles' => [],
            ],
        ];

        foreach ($people as $data) {
            $tagSlugs = $data['tags'];
            $styleNames = $data['styles'];
            unset($data['tags'], $data['styles']);

            $person = Person::where('name', $data['name'])->first() ?? $owner->people()->create($data);

            $person->tags()->sync(Tag::whereIn('slug', $tagSlugs)->pluck('id'));
            $person->styles()->sync(Style::whereIn('name', $styleNames)->pluck('id'));
        }
    }
}
