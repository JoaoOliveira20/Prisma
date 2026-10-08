"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { referenceToGalleryItem } from "@/lib/content";
import type { ContentType, Group, ReferenceItem } from "@/types/api";
import { ReferenceGallery } from "./ReferenceGallery";
import { ReferenceModal } from "./ReferenceModal";

type EntityReferencesProps = {
  type: ContentType;
  slug: string;
  references: ReferenceItem[];
  groups: Group[];
  canAdd: boolean;
};

export function EntityReferences({ type, slug, references, groups, canAdd }: EntityReferencesProps) {
  const [addOpen, setAddOpen] = useState(false);

  return (
    <>
      {canAdd && (
        <div className="mb-5">
          <Button type="button" onClick={() => setAddOpen(true)}>Adicionar referência</Button>
          <ReferenceModal open={addOpen} onClose={() => setAddOpen(false)} fixedLink={`${type}:${slug}`} />
        </div>
      )}
      <ReferenceGallery items={references.map(referenceToGalleryItem)} groups={groups} emptyMessage="Nenhuma referência adicionada ainda." />
    </>
  );
}
