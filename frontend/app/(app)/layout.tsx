import { CommandPalette } from "@/components/search/CommandPalette";
import { Sidebar } from "@/components/layout/Sidebar";
import { getCurrentUser } from "@/lib/data";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen md:flex">
      <Sidebar user={user} />
      <main className="min-w-0 flex-1">{children}</main>
      <CommandPalette />
    </div>
  );
}
