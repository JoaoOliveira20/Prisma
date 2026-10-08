export type IconName = "home" | "compass" | "layers" | "users" | "book" | "image" | "folder" | "tag" | "plus" | "heart" | "search";

export type NavigationItem = {
  label: string;
  href: string;
  icon: IconName;
};

export type NavigationGroup = {
  label: string;
  items: NavigationItem[];
};

export const navigationGroups: NavigationGroup[] = [
  {
    label: "Arquivo",
    items: [
      { label: "Início", href: "/", icon: "home" },
      { label: "Explorar", href: "/explorar", icon: "compass" },
    ],
  },
  {
    label: "Dimensões",
    items: [
      { label: "Estilos", href: "/estilos", icon: "layers" },
      { label: "Pessoas", href: "/pessoas", icon: "users" },
      { label: "Estratégias", href: "/estrategias", icon: "book" },
      { label: "Referências", href: "/referencias", icon: "image" },
    ],
  },
  {
    label: "Coleções",
    items: [
      { label: "Favoritos", href: "/favoritos", icon: "heart" },
      { label: "Grupos", href: "/grupos", icon: "folder" },
    ],
  },
  {
    label: "Vocabulário",
    items: [{ label: "Tags", href: "/tags", icon: "tag" }],
  },
];

export const navigationItems: NavigationItem[] = navigationGroups.flatMap((group) => group.items);
