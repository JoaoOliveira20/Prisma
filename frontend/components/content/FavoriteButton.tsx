"use client";

import { useOptimistic, useState, useTransition } from "react";
import { setFavorite } from "@/app/actions/content";
import type { GroupableType } from "@/types/api";

type FavoriteButtonProps = {
  type: GroupableType;
  slug: string;
  isFavorite: boolean;
  className?: string;
};

export function FavoriteButton({ type, slug, isFavorite, className = "" }: FavoriteButtonProps) {
  const [, startTransition] = useTransition();
  const [toggles, setToggles] = useState(0);
  const [optimisticFavorite, setOptimisticFavorite] = useOptimistic(isFavorite);

  const toggle = () => {
    setToggles((count) => count + 1);
    startTransition(async () => {
      setOptimisticFavorite(!optimisticFavorite);
      await setFavorite(type, slug, !optimisticFavorite);
    });
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={optimisticFavorite}
      aria-label={optimisticFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      className={`grid size-9 place-items-center rounded-full bg-surface-raised/95 text-text transition duration-200 hover:scale-105 hover:bg-surface-raised active:scale-95 ${className}`}
    >
      <svg key={toggles} viewBox="0 0 24 24" className={`size-4 ${toggles > 0 && optimisticFavorite ? "heart-pop" : ""}`} fill={optimisticFavorite ? "var(--color-accent)" : "none"} stroke={optimisticFavorite ? "var(--color-accent)" : "currentColor"} strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 20s-8-5-8-11a4.5 4.5 0 018-2.5A4.5 4.5 0 0120 9c0 6-8 11-8 11z" />
      </svg>
    </button>
  );
}
