import type { RouteRecordRaw } from "vue-router";
import type { Perfil } from "../css/design/palette";

// ============================================================
// Rotas DESKTOP — Admin, Chefe, INATRO, GESTMUL, ISSM, PRM
//
// ARQUITETURA:
//   • Admin      → /admin/dashboard → pages/dashboard/AdminDashboard.vue
//   • Outros 5   → /<perfil>/painel → pages/dashboard/dashboard.vue (comum)
//   • Perfil user→ /perfil          → pages/perfil/perfil.vue
//   • Perfil admin → /admin/perfil  → pages/perfil/AdminPerfil.vue
// ============================================================
export const routesDesktop: RouteRecordRaw[] = [
  {
    path: "/",
    component: () => import("../modules/desktop/layouts/MainLayout.vue"),
    children: [
      // =====================================================
      // PERFIL DO UTILIZADOR (comum — chefe, inatro, gestmul, issm, prm)
      // =====================================================
      {
        path: "perfil",
        name: "perfil",
        component: () => import("../modules/desktop/pages/perfil/perfil.vue"),
        meta: { perfis: ["chefe", "inatro", "gestmul", "issm", "prm"] as Perfil[] },
      },

      // =====================================================
      // PERFIL DO ADMIN
      // =====================================================
      {
        path: "admin/perfil",
        name: "admin-perfil",
        component: () =>
          import("../modules/desktop/pages/perfil/admin-perfil.vue"),
        meta: { perfis: ["admin"] as Perfil[] },
      },

      // =====================================================
      // ADMIN — dashboard próprio
      // =====================================================
      {
        path: "admin/dashboard",
        name: "admin-dashboard",
        component: () =>
          import("../modules/desktop/pages/dashboard/AdminDashboard.vue"),
        meta: { perfis: ["admin"] as Perfil[] },
      },
      {
        path: "admin/utilizadores",
        name: "admin-utilizadores",
        component: () =>
          import("../modules/desktop/pages/admin/utilizadores.vue"),
        meta: { perfis: ["admin"] as Perfil[] },
      },
      {
        path: "admin/postos",
        name: "admin-postos",
        component: () => import("../modules/desktop/pages/admin/postos.vue"),
        meta: { perfis: ["admin"] as Perfil[] },
      },
      {
        path: "admin/dispositivos",
        name: "admin-dispositivos",
        component: () =>
          import("../modules/desktop/pages/admin/dispositivos.vue"),
        meta: { perfis: ["admin"] as Perfil[] },
      },
      {
        path: "admin/integracoes",
        name: "admin-integracoes",
        component: () =>
          import("../modules/desktop/pages/admin/integracoes.vue"),
        meta: { perfis: ["admin"] as Perfil[] },
      },
      {
        path: "admin/auditoria",
        name: "admin-auditoria",
        component: () => import("../modules/desktop/pages/admin/auditoria.vue"),
        meta: { perfis: ["admin"] as Perfil[] },
      },
      {
        path: "admin/relatorios",
        name: "admin-relatorios",
        component: () =>
          import("../modules/desktop/pages/admin/relatorios.vue"),
        meta: { perfis: ["admin"] as Perfil[] },
      },
      {
        path: "admin/monitorizacao",
        name: "admin-monitorizacao",
        component: () =>
          import("../modules/desktop/pages/admin/monitorizacao.vue"),
        meta: { perfis: ["admin"] as Perfil[] },
      },
      {
        path: "admin/backups",
        name: "admin-backups",
        component: () => import("../modules/desktop/pages/admin/backups.vue"),
        meta: { perfis: ["admin"] as Perfil[] },
      },
      {
        path: "admin/perfis",
        name: "admin-perfis",
        component: () => import("../modules/desktop/pages/admin/perfis.vue"),
        meta: { perfis: ["admin"] as Perfil[] },
      },

      // =====================================================
      // CHEFE DE POSTO
      // =====================================================
      {
        path: "chefe/dashboard",
        name: "chefe-dashboard",
        component: () => import("../modules/desktop/pages/dashboard/dashboard.vue"),
        meta: { perfis: ["chefe"] as Perfil[] },
      },
      {
        path: "chefe/agentes",
        name: "chefe-agentes",
        component: () => import("../modules/desktop/pages/chefe/agentes.vue"),
        meta: { perfis: ["chefe"] as Perfil[] },
      },
      {
        path: "chefe/patrulhas",
        name: "chefe-patrulhas",
        component: () => import("../modules/desktop/pages/chefe/patrulhas.vue"),
        meta: { perfis: ["chefe"] as Perfil[] },
      },
      {
        path: "chefe/aprovacoes",
        name: "chefe-aprovacoes",
        component: () =>
          import("../modules/desktop/pages/chefe/aprovacoes.vue"),
        meta: { perfis: ["chefe"] as Perfil[] },
      },
      {
        path: "chefe/relatorios",
        name: "chefe-relatorios",
        component: () =>
          import("../modules/desktop/pages/chefe/relatorios.vue"),
        meta: { perfis: ["chefe"] as Perfil[] },
      },
      {
        path: "chefe/escalas",
        name: "chefe-escalas",
        component: () => import("../modules/desktop/pages/chefe/escalas.vue"),
        meta: { perfis: ["chefe"] as Perfil[] },
      },
      {
        path: "chefe/veiculos",
        name: "chefe-veiculos",
        component: () => import("../modules/desktop/pages/chefe/veiculos.vue"),
        meta: { perfis: ["chefe"] as Perfil[] },
      },

      // =====================================================
      // INATRO
      // =====================================================
      {
        path: "inatro/painel",
        name: "inatro-painel",
        component: () => import("../modules/desktop/pages/dashboard/dashboard.vue"),
        meta: { perfis: ["inatro"] as Perfil[] },
      },
      {
        path: "inatro/veiculos",
        name: "inatro-veiculos",
        component: () => import("../modules/desktop/pages/inatro/veiculos.vue"),
        meta: { perfis: ["inatro"] as Perfil[] },
      },
      {
        path: "inatro/inspecoes",
        name: "inatro-inspecoes",
        component: () =>
          import("../modules/desktop/pages/inatro/inspecoes.vue"),
        meta: { perfis: ["inatro"] as Perfil[] },
      },
      {
        path: "inatro/agendamentos",
        name: "inatro-agendamentos",
        component: () =>
          import("../modules/desktop/pages/inatro/Agendamentos.vue"),
        meta: { perfis: ["inatro"] as Perfil[] },
      },
      {
        path: "inatro/exportacao",
        name: "inatro-exportacao",
        component: () =>
          import("../modules/desktop/pages/inatro/exportacao.vue"),
        meta: { perfis: ["inatro"] as Perfil[] },
      },
      {
        path: "inatro/relatorios",
        name: "inatro-relatorios",
        component: () =>
          import("../modules/desktop/pages/inatro/relatorios.vue"),
        meta: { perfis: ["inatro"] as Perfil[] },
      },

      // =====================================================
      // GESTMUL
      // =====================================================
      {
        path: "gestmul/painel",
        name: "gestmul-painel",
        component: () => import("../modules/desktop/pages/dashboard/dashboard.vue"),
        meta: { perfis: ["gestmul"] as Perfil[] },
      },
      {
        path: "gestmul/multas",
        name: "gestmul-multas",
        component: () => import("../modules/desktop/pages/gestmul/multas.vue"),
        meta: { perfis: ["gestmul"] as Perfil[] },
      },
      {
        path: "gestmul/pagamentos",
        name: "gestmul-pagamentos",
        component: () =>
          import("../modules/desktop/pages/gestmul/pagamentos.vue"),
        meta: { perfis: ["gestmul"] as Perfil[] },
      },
      {
        path: "gestmul/contestacoes",
        name: "gestmul-contestacoes",
        component: () =>
          import("../modules/desktop/pages/gestmul/contestacoes.vue"),
        meta: { perfis: ["gestmul"] as Perfil[] },
      },
      {
        path: "gestmul/relatorios",
        name: "gestmul-relatorios",
        component: () =>
          import("../modules/desktop/pages/gestmul/relatorios.vue"),
        meta: { perfis: ["gestmul"] as Perfil[] },
      },
      {
        path: "gestmul/exportacao",
        name: "gestmul-exportacao",
        component: () =>
          import("../modules/desktop/pages/gestmul/exportacao.vue"),
        meta: { perfis: ["gestmul"] as Perfil[] },
      },

      // =====================================================
      // ISSM
      // =====================================================
      {
        path: "issm/painel",
        name: "issm-painel",
        component: () => import("../modules/desktop/pages/dashboard/dashboard.vue"),
        meta: { perfis: ["issm"] as Perfil[] },
      },
      {
        path: "issm/apolices",
        name: "issm-apolices",
        component: () => import("../modules/desktop/pages/issm/apolices.vue"),
        meta: { perfis: ["issm"] as Perfil[] },
      },
      {
        path: "issm/sinistros",
        name: "issm-sinistros",
        component: () => import("../modules/desktop/pages/issm/sinistros.vue"),
        meta: { perfis: ["issm"] as Perfil[] },
      },
      {
        path: "issm/validacao",
        name: "issm-validacao",
        component: () => import("../modules/desktop/pages/issm/validacao.vue"),
        meta: { perfis: ["issm"] as Perfil[] },
      },
      {
        path: "issm/seguradoras",
        name: "issm-seguradoras",
        component: () =>
          import("../modules/desktop/pages/issm/Seguradoras.vue"),
        meta: { perfis: ["issm"] as Perfil[] },
      },
      {
        path: "issm/relatorios",
        name: "issm-relatorios",
        component: () => import("../modules/desktop/pages/issm/relatorios.vue"),
        meta: { perfis: ["issm"] as Perfil[] },
      },

      // =====================================================
      // PRM
      // =====================================================
      {
        path: "prm/painel",
        name: "prm-painel",
        component: () => import("../modules/desktop/pages/dashboard/dashboard.vue"),
        meta: { perfis: ["prm"] as Perfil[] },
      },
      {
        path: "prm/hotlist",
        name: "prm-hotlist",
        component: () => import("../modules/desktop/pages/prm/hotlist.vue"),
        meta: { perfis: ["prm"] as Perfil[] },
      },
      {
        path: "prm/abordagens",
        name: "prm-abordagens",
        component: () => import("../modules/desktop/pages/prm/abordagens.vue"),
        meta: { perfis: ["prm"] as Perfil[] },
      },
      {
        path: "prm/alertas",
        name: "prm-alertas",
        component: () => import("../modules/desktop/pages/prm/alertas.vue"),
        meta: { perfis: ["prm"] as Perfil[] },
      },
      {
        path: "prm/relatorios",
        name: "prm-relatorios",
        component: () => import("../modules/desktop/pages/prm/relatorios.vue"),
        meta: { perfis: ["prm"] as Perfil[] },
      },
      {
        path: "prm/mapa",
        name: "prm-mapa",
        component: () => import("../modules/desktop/pages/prm/Mapa.vue"),
        meta: { perfis: ["prm"] as Perfil[] },
      },
    ],
  },
];