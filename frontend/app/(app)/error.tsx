"use client";

import { Button } from "@/components/ui/Button";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="page-x pt-24" role="alert">
      <p className="eyebrow">Algo interrompeu a consulta</p>
      <h1 className="mt-4 max-w-2xl font-serif text-5xl leading-tight">Não foi possível abrir esta página.</h1>
      <p className="mt-5 max-w-md text-base leading-relaxed text-text-muted">O arquivo não respondeu como esperado. Verifique a conexão com a API e tente novamente.</p>
      <Button className="mt-8" onClick={reset}>Tentar novamente</Button>
    </div>
  );
}
