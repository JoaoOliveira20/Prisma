import type { Metadata } from "next";
import { ContentBrowser } from "@/components/content/ContentBrowser";

export const metadata: Metadata = { title: "Estratégias" };

export default function StrategiesPage({ searchParams }: PageProps<"/estrategias">) {
  return <ContentBrowser type="strategy" searchParams={searchParams} />;
}
