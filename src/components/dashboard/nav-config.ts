import {
  LayoutDashboard,
  MessageSquare,
  Calendar,
  Users,
  Settings,
  BarChart3,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  children?: { label: string; href: string }[];
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Inbox", href: "/inbox", icon: MessageSquare },
  { label: "Agendamentos", href: "/agendamentos", icon: Calendar },
  { label: "Pacientes", href: "/pacientes", icon: Users },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  {
    label: "Configurações",
    href: "/configuracoes",
    icon: Settings,
    children: [
      { label: "Clínica", href: "/configuracoes/clinica" },
      { label: "Dentistas", href: "/configuracoes/dentistas" },
      { label: "Procedimentos", href: "/configuracoes/procedimentos" },
      { label: "Conhecimento (IA)", href: "/configuracoes/conhecimento" },
      { label: "WhatsApp", href: "/configuracoes/whatsapp" },
      { label: "Integrações", href: "/configuracoes/integracoes" },
      { label: "IA", href: "/configuracoes/ia" },
      { label: "Equipe", href: "/configuracoes/equipe" },
      { label: "Faturamento", href: "/configuracoes/faturamento" },
    ],
  },
];

export const ROUTE_LABELS: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/inbox": "Inbox",
  "/agendamentos": "Agendamentos",
  "/pacientes": "Pacientes",
  "/analytics": "Analytics",
  "/configuracoes": "Configurações",
  "/configuracoes/clinica": "Clínica",
  "/configuracoes/dentistas": "Dentistas",
  "/configuracoes/procedimentos": "Procedimentos",
  "/configuracoes/conhecimento": "Conhecimento (IA)",
  "/configuracoes/whatsapp": "WhatsApp",
  "/configuracoes/integracoes": "Integrações",
  "/configuracoes/ia": "IA",
  "/configuracoes/equipe": "Equipe",
  "/configuracoes/faturamento": "Faturamento",
};
