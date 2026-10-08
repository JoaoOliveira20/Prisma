import { Sidebar } from "@/components/layout/Sidebar";
import { CommandPalette } from "@/components/search/CommandPalette";
import { getCurrentUser } from "@/lib/data";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen lg:flex">
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:text-primary-foreground">
        Pular para o conteúdo
      </a>
      <Sidebar user={user} />
      <main id="conteudo" tabIndex={-1} className="min-w-0 flex-1 pb-24 focus:outline-none">
        <div className="mx-auto w-full max-w-[100rem]">{children}</div>
      </main>
      <CommandPalette />
    </div>
  );
}
