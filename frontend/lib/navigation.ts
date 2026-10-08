export type NavigationItem = {
  label: string;
  href: string | null;
  icon: "home" | "compass" | "layers" | "users" | "book" | "image" | "folder" | "tag";
};

export const navigationItems: NavigationItem[] = [
  { label: "Início", href: "/", icon: "home" },
  { label: "Explorar", href: "/explorar", icon: "compass" },
  { label: "Estilos", href: "/estilos", icon: "layers" },
  { label: "Pessoas", href: "/pessoas", icon: "users" },
  { label: "Estratégias", href: "/estrategias", icon: "book" },
  { label: "Referências", href: "/referencias", icon: "image" },
  { label: "Tags", href: "/tags", icon: "tag" },
  { label: "Grupos", href: "/grupos", icon: "folder" },
];
