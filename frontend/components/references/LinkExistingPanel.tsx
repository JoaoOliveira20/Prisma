"use client";

import Image from "next/image";
import { useEffect, useState, useTransition } from "react";
import { linkReferences } from "@/app/actions/references";
import { Button } from "@/components/ui/Button";
import type { ContentType, GalleryItem } from "@/types/api";

type LinkExistingPanelProps = {
  type: ContentType;
  slug: string;
  onDone: () => void;
};

export function LinkExistingPanel({ type, slug, onDone }: LinkExistingPanelProps) {
  const [items, setItems] = useState<GalleryItem[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetch(`/api/my-references?q=${encodeURIComponent(query)}`, { signal: controller.signal })
        .then((response) => (response.ok ? response.json() : Promise.reject()))
        .then(({ references }: { references: GalleryItem[] }) =>
          setItems(references.filter((reference) => !reference.links?.some((link) => link.type === type && link.slug === slug))),
        )
        .catch((error) => error?.name !== "AbortError" && setFailed(true));
    }, 180);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [type, slug, query]);

  const toggle = (id: number) => setSelected((current) => (current.includes(id) ? current.filter((value) => value !== id) : [...current, id]));

  const submit = () =>
    startTransition(async () => {
      const result = await linkReferences(type, slug, selected);
      if (result?.success) onDone();
      else setMessage(result?.message ?? "Não foi possível vincular.");
    });

  if (failed) return <p role="alert" className="text-sm text-danger">Não foi possível carregar suas referências.</p>;
  if (!items) return <p className="text-sm text-text-muted">Carregando suas referências…</p>;
  return (
    <div className="space-y-4">
      <p className="text-sm text-text-muted">Escolha as referências suas que também inspiram ou ilustram este conteúdo.</p>
      <input
        type="search"
        aria-label="Buscar suas referências"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Buscar por título ou crédito"
        className="h-10 w-full rounded-sm border border-border-strong bg-transparent px-3 text-sm placeholder:text-text-muted focus:border-text"
      />
      {items.length === 0 && (
        <p className="rounded-sm border border-dashed border-border px-4 py-8 text-center text-sm text-text-muted">
          {query ? "Nenhuma referência sua encontrada." : "Você não tem outras referências para vincular a este conteúdo."}
        </p>
      )}
      <ul className="grid max-h-80 grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3">
        {items.map((item) => (
          <li key={item.key}>
            <label className="block cursor-pointer space-y-1">
              <span className="relative block overflow-hidden rounded-sm border border-border">
                <Image src={item.image_url} alt="" width={300} height={200} unoptimized className="h-24 w-full object-cover" />
                <input type="checkbox" checked={selected.includes(item.id!)} onChange={() => toggle(item.id!)} aria-label={`Vincular ${item.title}`} className="absolute left-2 top-2" />
              </span>
              <span className="block truncate text-xs">{item.title}</span>
            </label>
          </li>
        ))}
      </ul>
      {message && <p role="alert" className="text-sm text-danger">{message}</p>}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onDone}>Cancelar</Button>
        <Button type="button" onClick={submit} disabled={pending || selected.length === 0}>
          {pending ? "Vinculando…" : `Vincular ${selected.length || ""}`.trim()}
        </Button>
      </div>
    </div>
  );
}
