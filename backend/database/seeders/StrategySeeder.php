<?php

namespace Database\Seeders;

use App\Models\Strategy;
use App\Models\Style;
use App\Models\Tag;
use App\Models\User;
use Database\Seeders\Concerns\CopiesSeedImages;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class StrategySeeder extends Seeder
{
    use CopiesSeedImages;

    public function run(): void
    {
        $owner = User::where('email', 'demo@prisma.test')->firstOrFail();

        $strategies = [
            [
                'name' => 'Menos, mas melhor',
                'category' => 'Princípio',
                'summary' => 'Concentrar-se no essencial para que cada elemento tenha uma razão de existir.',
                'description' => "Associada ao trabalho de Dieter Rams, a ideia de menos, mas melhor propõe que o bom design elimina o supérfluo e valoriza o que importa.\n\nNa prática, significa questionar cada elemento de uma composição ou produto: se ele não contribui para a função ou para a clareza, pode ser removido.",
                'tags' => ['design', 'funcionalismo'],
                'styles' => ['Minimalismo'],
            ],
            [
                'name' => 'A forma segue a função',
                'category' => 'Princípio',
                'summary' => 'A aparência de um objeto deve decorrer do seu uso e da sua estrutura.',
                'description' => "Expressão popularizada pela arquitetura e pelo design modernos, a forma segue a função orienta o projeto a partir do uso, e não do ornamento.\n\nFoi um dos pilares da pedagogia da Bauhaus e continua influenciando o design de produtos e interfaces.",
                'tags' => ['design', 'funcionalismo', 'moderno'],
                'styles' => ['Bauhaus', 'Minimalismo'],
            ],
            [
                'name' => 'Sistemas de grade',
                'category' => 'Metodologia',
                'summary' => 'Organizar o layout sobre uma estrutura modular para garantir ritmo e consistência.',
                'description' => "Grades dividem o espaço em módulos regulares que guiam o posicionamento de texto e imagens. Designers como Massimo Vignelli as usaram para criar sistemas visuais coerentes entre diferentes peças.\n\nUma grade bem definida acelera decisões e torna o conjunto reconhecível.",
                'tags' => ['design', 'tipografia'],
                'styles' => ['Bauhaus', 'Minimalismo'],
            ],
            [
                'name' => 'Honestidade dos materiais',
                'category' => 'Princípio',
                'summary' => 'Mostrar os materiais e a estrutura como são, sem disfarces.',
                'description' => 'No brutalismo, o concreto aparente e a estrutura exposta são parte da linguagem do edifício. A honestidade dos materiais valoriza textura, peso e processo construtivo como expressão estética.',
                'tags' => ['arquitetura', 'urbano'],
                'styles' => ['Brutalismo'],
            ],
            [
                'name' => 'Design sem pensamento',
                'category' => 'Filosofia',
                'summary' => 'Criar objetos que se encaixam no comportamento intuitivo das pessoas.',
                'description' => 'Proposta por Naoto Fukasawa, a ideia parte da observação de gestos que fazemos sem refletir. O objetivo é que o produto pareça óbvio e natural no momento do uso.',
                'tags' => ['design'],
                'styles' => ['Minimalismo'],
            ],
        ];

        foreach ($strategies as $data) {
            $tagSlugs = $data['tags'];
            $styleNames = $data['styles'];
            unset($data['tags'], $data['styles']);

            $strategy = Strategy::where('user_id', $owner->id)->where('name', $data['name'])->first() ?? $owner->strategies()->create($data);

            if ($strategy->image_path === null && ($path = $this->copySeedImage(Str::slug($strategy->name), 'images'))) {
                $strategy->forceFill(['image_path' => $path])->save();
            }

            $strategy->tags()->sync(Tag::where('user_id', $owner->id)->whereIn('slug', $tagSlugs)->pluck('id'));
            $strategy->styles()->sync(Style::where('user_id', $owner->id)->whereIn('name', $styleNames)->pluck('id'));
        }
    }
}
