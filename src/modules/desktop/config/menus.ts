import type { Perfil } from "@/css/design/palette";

// ============================================================
// SICAM — Configuração de menus por perfil
// ============================================================

export interface MenuItem {
  to: string;
  label: string;
  icon: string;
  badge?: number | string;
  badgeVariant?: "regular" | "atencao" | "critico" | "info";
  shortcut?: string;
  disabled?: boolean;
  destaque?: boolean; // item em destaque (ex.: nova função)
}

export interface MenuGroup {
  titulo: string;
  items: MenuItem[];
}

// ------------------------------------------------------------
// Admin — visão global do sistema
// ------------------------------------------------------------
const MENU_ADMIN: MenuGroup[] = [
  {
    titulo: "Visão Geral",
    items: [
      {
        to: "/admin/dashboard",
        label: "Dashboard",
        icon: "dashboard",
        shortcut: "D",
      },
    ],
  },
  {
    titulo: "Gestão",
    items: [
      {
        to: "/admin/utilizadores",
        label: "Utilizadores",
        icon: "people",
        badge: 248,
        badgeVariant: "info",
      },
      {
        to: "/admin/perfis",
        label: "Perfis & Permissões",
        icon: "admin_panel_settings",
      },
      { to: "/admin/postos", label: "Postos", icon: "location_city" },
      {
        to: "/admin/dispositivos",
        label: "Dispositivos",
        icon: "devices",
        badge: 3,
        badgeVariant: "atencao",
      },
      { to: "/admin/relatorios", label: "Relatórios", icon: "bar_chart" },
    ],
  },
  {
    titulo: "Sistema",
    items: [
      {
        to: "/admin/monitorizacao",
        label: "Monitorização",
        icon: "monitor_heart",
        badge: 2,
        badgeVariant: "critico",
      },
      { to: "/admin/integracoes", label: "Integrações", icon: "api" },
      { to: "/admin/auditoria", label: "Auditoria", icon: "security" },
      { to: "/admin/backups", label: "Backups", icon: "backup" },
      
    ],
  },
];

// ------------------------------------------------------------
// Chefe de Posto
// ------------------------------------------------------------
const MENU_CHEFE: MenuGroup[] = [
  {
    titulo: "Painel",
    items: [
      {
        to: "/chefe/dashboard",
        label: "Dashboard",
        icon: "dashboard",
        shortcut: "D",
      },
    ],
  },
  {
    titulo: "Operações",
    items: [
      {
        to: "/chefe/agentes",
        label: "Agentes",
        icon: "people",
        badge: 14,
        badgeVariant: "info",
      },
      {
        to: "/chefe/escalas",
        label: "Escalas",
        icon: "calendar_today",
        badge: 2,
        badgeVariant: "atencao",
      },
      {
        to: "/chefe/patrulhas",
        label: "Patrulhas",
        icon: "shield",
        badge: 1,
        badgeVariant: "atencao",
      },
      {
        to: "/chefe/veiculos",
        label: "Veículos críticos",
        icon: "warning",
        badge: 3,
        badgeVariant: "critico",
      },
    ],
  },
  {
    titulo: "Aprovações",
    items: [
      {
        to: "/chefe/aprovacoes",
        label: "Aprovações",
        icon: "check_circle",
        badge: 5,
        badgeVariant: "atencao",
      },
      { to: "/chefe/relatorios", label: "Relatórios", icon: "bar_chart" },
    ],
  },
];

// ------------------------------------------------------------
// INATRO
// ------------------------------------------------------------
const MENU_INATRO: MenuGroup[] = [
  {
    titulo: "Painel",
    items: [
      {
        to: "/inatro/painel",
        label: "Visão Geral",
        icon: "dashboard",
        shortcut: "D",
      },
    ],
  },
  {
    titulo: "Veículos",
    items: [
      { to: "/inatro/veiculos", label: "Veículos", icon: "directions_car" },
      {
        to: "/inatro/inspecoes",
        label: "Inspecções",
        icon: "build",
        badge: 32,
        badgeVariant: "critico",
      },
      {
        to: "/inatro/agendamentos",
        label: "Agendamentos",
        icon: "event",
        badge: 42,
        badgeVariant: "info",
      },
    ],
  },
  {
    titulo: "Relatórios",
    items: [
      { to: "/inatro/exportacao", label: "Exportação", icon: "file_download" },
      { to: "/inatro/relatorios", label: "Relatórios", icon: "bar_chart" },
    ],
  },
];

// ------------------------------------------------------------
// GESTMUL
// ------------------------------------------------------------
const MENU_GESTMUL: MenuGroup[] = [
  {
    titulo: "Painel",
    items: [
      {
        to: "/gestmul/painel",
        label: "Visão Geral",
        icon: "dashboard",
        shortcut: "D",
      },
    ],
  },
  {
    titulo: "Multas",
    items: [
      {
        to: "/gestmul/multas",
        label: "Multas",
        icon: "receipt_long",
        badge: 89,
        badgeVariant: "atencao",
      },
      { to: "/gestmul/pagamentos", label: "Pagamentos", icon: "payments" },
      {
        to: "/gestmul/contestacoes",
        label: "Contestações",
        icon: "gavel",
        badge: 35,
        badgeVariant: "critico",
      },
    ],
  },
  {
    titulo: "Análise",
    items: [
      { to: "/gestmul/relatorios", label: "Relatórios", icon: "bar_chart" },
      { to: "/gestmul/exportacao", label: "Exportação", icon: "file_download" }, // ✅ CORRIGIDO
    ],
  },
];

// ------------------------------------------------------------
// ISSM
// ------------------------------------------------------------
const MENU_ISSM: MenuGroup[] = [
  {
    titulo: "Painel",
    items: [
      {
        to: "/issm/painel",
        label: "Visão Geral",
        icon: "dashboard",
        shortcut: "D",
      },
    ],
  },
  {
    titulo: "Seguros",
    items: [
      {
        to: "/issm/apolices",
        label: "Apólices",
        icon: "shield",
        badge: 58,
        badgeVariant: "atencao",
      },
      {
        to: "/issm/sinistros",
        label: "Sinistros",
        icon: "report_problem",
        badge: 24,
        badgeVariant: "critico",
      },
      { to: "/issm/validacao", label: "Validação", icon: "verified_user" },
      {
        to: "/issm/seguradoras",
        label: "Seguradoras",
        icon: "business",
        badge: 8,
        badgeVariant: "info",
      },
    ],
  },
  {
    titulo: "Análise",
    items: [{ to: "/issm/relatorios", label: "Relatórios", icon: "bar_chart" }],
  },
];

// ------------------------------------------------------------
// PRM
// ------------------------------------------------------------
const MENU_PRM: MenuGroup[] = [
  {
    titulo: "Painel",
    items: [
      {
        to: "/prm/painel",
        label: "Visão Geral",
        icon: "dashboard",
        shortcut: "D",
      },
    ],
  },
  {
    titulo: "Operações",
    items: [
      {
        to: "/prm/hotlist",
        label: "Hotlist",
        icon: "local_police",
        badge: 128,
        badgeVariant: "critico",
      },
      { to: "/prm/abordagens", label: "Abordagens", icon: "visibility" },
      { to: "/prm/mapa", label: "Mapa operacional", icon: "map" },
    ],
  },
  {
    titulo: "Alertas",
    items: [
      {
        to: "/prm/alertas",
        label: "Alertas",
        icon: "notifications_active",
        badge: 12,
        badgeVariant: "atencao",
      },
      { to: "/prm/relatorios", label: "Relatórios", icon: "bar_chart" },
    ],
  },
];

// ------------------------------------------------------------
// Mapa perfil → grupos
// ------------------------------------------------------------
export const MENUS: Record<string, MenuGroup[]> = {
  admin: MENU_ADMIN,
  chefe: MENU_CHEFE,
  inatro: MENU_INATRO,
  gestmul: MENU_GESTMUL,
  issm: MENU_ISSM,
  prm: MENU_PRM,
};

export function menuDoPerfil(perfil: Perfil | null): MenuGroup[] {
  if (!perfil) return [];
  return MENUS[perfil] ?? [];
}

// ------------------------------------------------------------
// Rota inicial por perfil
// ------------------------------------------------------------
export const ROTA_INICIAL: Record<Perfil, string> = {
  agente: "/agente/inicio",
  chefe: "/chefe/dashboard",
  admin: "/admin/dashboard",
  inatro: "/inatro/painel",
  gestmul: "/gestmul/painel",
  issm: "/issm/painel",
  prm: "/prm/painel",
  cidadao: "/cidadao/portal",
};
