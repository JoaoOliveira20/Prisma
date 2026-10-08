import type { Metadata } from "next";
import { ContentBrowser } from "@/components/content/ContentBrowser";

export const metadata: Metadata = { title: "Pessoas" };

export default function PeoplePage({ searchParams }: PageProps<"/pessoas">) {
  return <ContentBrowser type="person" searchParams={searchParams} />;
}
