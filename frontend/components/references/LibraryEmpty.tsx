import Link from "next/link";
import { LinkButton } from "@/components/ui/Button";
import { NewReferenceButton } from "./NewReferenceButton";

export function LibraryEmpty({ filtered, query }: { filtered: boolean; query?: string }) {
  if (filtered) {
    return (
      <div className="results-in max-w-2xl py-10">
        <p className="eyebrow">Sem resultados</p>
        <h2 className="mt-3 font-serif text-4xl leading-tight">{query ? `Nada encontrado para “${query}”.` : "Nenhuma imagem com esses filtros."}</h2>
        <p className="mt-4 leading-relaxed text-text-muted">
          A busca olha título, descrição, crédito, fonte, tags e os nomes de estilos, pessoas e estratégias vinculados. Tente outra palavra ou afrouxe um filtro.
        </p>
        <div className="mt-6">
          <LinkButton href="/referencias" variant="secondary">Ver a biblioteca inteira</LinkButton>
        </div>
      </div>
    );
  }

  return (
    <div className="results-in max-w-2xl py-10">
      <p className="eyebrow">Biblioteca vazia</p>
      <h2 className="mt-3 font-serif text-5xl leading-[1.05]">O repertório começa com uma imagem.</h2>
      <p className="mt-5 max-w-lg leading-relaxed text-text-muted">
        Cada referência pode pertencer a vários estilos, pessoas e estratégias. É assim que uma imagem solta vira conexão. Adicione a primeira ou entre por um estilo e junte imagens a ele.
      </p>
      <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
        <NewReferenceButton />
        <Link href="/estilos" className="nav-link text-sm">Explorar os estilos</Link>
      </div>
    </div>
  );
}
