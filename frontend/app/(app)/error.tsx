"use client";

import { Button } from "@/components/ui/Button";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="px-5 py-20 text-center sm:px-10" role="alert">
      <h1 className="font-serif text-2xl">Algo deu errado</h1>
      <p className="mt-2 text-sm text-text-muted">Não foi possível carregar este conteúdo. Verifique a conexão com a API.</p>
      <Button className="mt-6" onClick={reset}>Tentar novamente</Button>
    </div>
  );
}
