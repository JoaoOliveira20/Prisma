import type { Metadata } from "next";
import { ContentBrowser } from "@/components/content/ContentBrowser";

export const metadata: Metadata = { title: "Estilos" };

export default function StylesPage({ searchParams }: PageProps<"/estilos">) {
  return <ContentBrowser type="style" searchParams={searchParams} />;
}
