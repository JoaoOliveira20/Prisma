<?php

namespace Database\Seeders;

use App\Models\Style;
use App\Models\Tag;
use App\Models\User;
use Database\Seeders\Concerns\CopiesSeedImages;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class StyleSeeder extends Seeder
{
    use CopiesSeedImages;

    public function run(): void
    {
        $owner = User::firstOrCreate(
            ['email' => 'demo@prisma.test'],
            ['name' => 'Demo Prisma', 'password' => 'password']
        );

        $styles = [
            [
                'name' => 'Minimalismo',
                'summary' => 'Menos, mas melhor: redução à essência da forma, da cor e do espaço.',
                'history' => "O minimalismo surge nas artes visuais dos Estados Unidos nos anos 1960, em oposição à carga emocional do expressionismo abstrato. Artistas como Donald Judd, Dan Flavin e Agnes Martin buscavam obras literais, sem ilusão nem simbolismo.\n\nNo design e na arquitetura, a ideia de reduzir ao essencial dialoga com o modernismo e com a estética japonesa do vazio, influenciando desde interfaces digitais até a arquitetura residencial.",
                'influences' => 'Modernismo, Bauhaus, De Stijl, estética zen e wabi-sabi.',
                'characteristics' => ['Formas simples', 'Paleta reduzida', 'Espaço negativo', 'Ausência de ornamento', 'Funcionalidade'],
                'period' => '1960 - atual',
                'origin' => 'Estados Unidos',
                'tags' => ['design', 'arte', 'arquitetura', 'moderno'],
            ],
            [
                'name' => 'Bauhaus',
                'summary' => 'Funcionalidade, forma e um novo olhar sobre o mundo moderno.',
                'history' => "A Bauhaus foi uma escola de design, artes e arquitetura fundada por Walter Gropius em Weimar, em 1919. Sua proposta unia arte, ofício e tecnologia, defendendo uma estética funcional, formas simples e uma nova relação entre design e sociedade.\n\nFechada pelo regime nazista em 1933, seus professores e alunos se espalharam pelo mundo e levaram suas ideias a escolas e estúdios que moldaram o design do século XX.",
                'influences' => 'Construtivismo russo, De Stijl, Arts and Crafts, Deutscher Werkbund.',
                'characteristics' => ['Formas geométricas', 'Funcionalidade', 'Cores primárias', 'Tipografia limpa', 'Simplicidade'],
                'period' => '1919 - 1933',
                'origin' => 'Alemanha',
                'tags' => ['design', 'arte', 'arquitetura', 'moderno', 'tipografia', 'funcionalismo'],
            ],
            [
                'name' => 'Brutalismo',
                'summary' => 'Concreto aparente, massa e honestidade estrutural.',
                'history' => "O termo vem do francês béton brut, concreto bruto, e foi popularizado nos anos 1950 a partir da obra de Le Corbusier. A arquitetura brutalista expõe materiais e estrutura sem revestimentos, com volumes imponentes e repetição modular.\n\nMais recentemente, o brutalismo também inspirou um movimento de web design que rejeita o polimento comercial em favor de interfaces cruas e diretas.",
                'influences' => 'Le Corbusier, modernismo, arquitetura utilitária do pós-guerra.',
                'characteristics' => ['Concreto aparente', 'Volumes massivos', 'Honestidade dos materiais', 'Geometria repetitiva'],
                'period' => '1950 - 1970',
                'origin' => 'Reino Unido',
                'tags' => ['arquitetura', 'urbano', 'moderno'],
            ],
            [
                'name' => 'Y2K',
                'summary' => 'O otimismo tecnológico do fim dos anos 1990 e início dos 2000.',
                'history' => "A estética Y2K reúne o imaginário digital da virada do milênio: superfícies metálicas, translucidez, formas fluidas e uma visão otimista do futuro. Foi moldada por produtos eletrônicos, videogames, a internet em expansão e a cultura pop da época.\n\nSeu retorno recente está ligado à nostalgia e à reinterpretação dessas referências na moda, na música e no design gráfico.",
                'influences' => 'Futurismo, cultura cyber, design industrial de consumo, cultura pop.',
                'characteristics' => ['Metalizado e cromado', 'Translucidez', 'Formas orgânicas', 'Cores vibrantes', 'Tecnologia como símbolo'],
                'period' => '1998 - 2004',
                'origin' => 'Global',
                'tags' => ['digital', 'cultura-pop', 'retro', 'tecnologia'],
            ],
            [
                'name' => 'Vaporwave',
                'summary' => 'Nostalgia digital, ironia e a estética de um futuro que não veio.',
                'history' => "Nascido na internet nos anos 2010, o vaporwave mistura imagens de computação dos anos 1990, estátuas clássicas, publicidade e arquitetura de shoppings. Sua crítica ao consumo e à nostalgia se expressa em tons de rosa e ciano, grades em perspectiva e fragmentos de texto em japonês.\n\nA estética acompanhou um gênero musical homônimo e circulou por comunidades online, tornando-se uma referência recorrente da cultura visual digital.",
                'influences' => 'Cultura da internet, publicidade dos anos 1980 e 1990, arte clássica, música eletrônica.',
                'characteristics' => ['Rosa e ciano', 'Grades em perspectiva', 'Estátuas clássicas', 'Nostalgia digital', 'Glitch'],
                'period' => '2010 - atual',
                'origin' => 'Internet',
                'tags' => ['digital', 'cultura-pop', 'cor', 'retro'],
            ],
        ];

        foreach ($styles as $data) {
            $tagSlugs = $data['tags'];
            unset($data['tags']);

            $style = Style::where('user_id', $owner->id)->where('name', $data['name'])->first()
                ?? $owner->styles()->create($data);

            if ($style->image_path === null && ($path = $this->copySeedImage(Str::slug($style->name), 'images'))) {
                $style->forceFill(['image_path' => $path])->save();
            }

            $style->tags()->sync(Tag::where('user_id', $owner->id)->whereIn('slug', $tagSlugs)->pluck('id'));
        }
    }
}
