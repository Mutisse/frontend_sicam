import type { RouteRecordRaw } from 'vue-router'

// ============================================================
// Rotas PORTAL — Cidadão (acesso público, sem autenticação)
// ============================================================
export const routesPortal: RouteRecordRaw[] = [
  {
    path: '/cidadao',
    component: () => import('@/modules/portal/layouts/PortalLayout.vue'),
    redirect: '/cidadao/portal',
    children: [
      { path: 'portal',     component: () => import('@/modules/portal/pages/portal.vue') },
      { path: 'multas',     component: () => import('@/modules/portal/pages/multas.vue') },
      { path: 'carta',      component: () => import('@/modules/portal/pages/carta.vue') },
      { path: 'noticias',   component: () => import('@/modules/portal/pages/noticias.vue') },
      { path: 'faq',        component: () => import('@/modules/portal/pages/faq.vue') },
      { path: 'assistente', component: () => import('@/modules/portal/pages/assistente.vue') },
    ],
  },
]