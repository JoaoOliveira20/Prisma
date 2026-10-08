import { navigationItems, type IconName } from "./navigation";

export type PaletteItem = {
  id: string;
  label: string;
  subtitle: string | null;
  href: string;
  icon: IconName | null;
  imageUrl: string | null;
};

export type PaletteGroup = {
  label: string;
  items: PaletteItem[];
};

const command = (id: string, label: string, href: string, icon: IconName): PaletteItem => ({
  id,
  label,
  subtitle: null,
  href,
  icon,
  imageUrl: null,
});

const goToCommands = navigationItems.map((item) => command(`go:${item.href}`, item.label, item.href, item.icon));

const createCommands = [
  command("create:style", "Novo estilo", "/estilos/novo", "plus"),
  command("create:person", "Nova pessoa", "/pessoas/novo", "plus"),
  command("create:strategy", "Nova estratégia", "/estrategias/novo", "plus"),
  command("create:reference", "Nova referência", "/referencias?nova=1", "plus"),
];

const commandGroups: PaletteGroup[] = [
  { label: "Ir para", items: goToCommands },
  { label: "Criar", items: createCommands },
];

const normalize = (text: string) => text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

export function matchCommands(query: string): PaletteGroup[] {
  const term = normalize(query.trim());

  return commandGroups
    .map((group) => ({ ...group, items: group.items.filter((item) => normalize(item.label).includes(term)) }))
    .filter((group) => group.items.length > 0);
}
