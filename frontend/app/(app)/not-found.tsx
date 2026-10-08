import { LinkButton } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="px-5 py-20 text-center sm:px-10">
      <h1 className="font-serif text-2xl">Conteúdo não encontrado</h1>
      <p className="mt-2 text-sm text-text-muted">Ele pode ter sido removido ou o endereço está incorreto.</p>
      <LinkButton href="/estilos" variant="secondary" className="mt-6">Voltar aos estilos</LinkButton>
    </div>
  );
}
