import { LinkButton } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="page-x pt-24">
      <p className="eyebrow">Registro não encontrado</p>
      <h1 className="mt-4 max-w-2xl font-serif text-5xl leading-tight">Isto não está no arquivo.</h1>
      <p className="mt-5 max-w-md text-base leading-relaxed text-text-muted">O conteúdo pode ter sido removido ou o endereço está incorreto.</p>
      <div className="mt-8 flex gap-3">
        <LinkButton href="/explorar" variant="secondary">Explorar o arquivo</LinkButton>
        <LinkButton href="/">Ir para o início</LinkButton>
      </div>
    </div>
  );
}
