// src/router/index.ts
import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { createPinia, type Pinia } from 'pinia'
import { useAuthStore } from '../stores/auth'
import type { Perfil } from '../css/design/palette'

import { routesDesktop } from './routes.desktop'
import { routesMobile } from './routes.mobile'
import { routesPortal } from './routes.portal'

// ============================================================
// Rotas de autenticação
// ============================================================
const routesAuth: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login-layout',
    component: () => import('../auth/layouts/AuthLayout.vue'),
    children: [
      {
        path: '',
        name: 'login',
        component: () => import('../auth/pages/login.vue'),
      },
    ],
    meta: { publico: true },  // ⭐ marca como pública
  },
  {
    path: '/:catchAll(.*)*',
    name: 'not-found',
    component: () => import('../auth/pages/ErrorNotFound.vue'),
    meta: { publico: true },
  },
]

const routes: RouteRecordRaw[] = [
  ...routesAuth,
  ...routesDesktop,
  ...routesMobile,
  ...routesPortal,
]

// Pinia — instância ÚNICA partilhada
export const pinia: Pinia = createPinia()

export default function () {
  const router = createRouter({
    history: createWebHashHistory(),
    routes,
  })

  router.beforeEach(async (to) => {
    const auth = useAuthStore(pinia)

    // ── 1. Primeira navegação: restaurar sessão ──
    if (!auth._restaurado) {
      await auth.restaurar()
    }

    const estáAutenticado = auth.autenticado
    const éRotaLogin = to.name === 'login' || to.path === '/login'
    const éPublica = to.meta.publico === true

    // ── 2. Rotas públicas (login, not-found, cidadão) ──
    if (éRotaLogin || éPublica) {
      // Já autenticado e tenta ir para login → manda para o painel
      if (éRotaLogin && estáAutenticado) {
        return { path: auth.rotaInicial }
      }
      return true
    }

    // ── 3. Portal do cidadão (sempre acessível) ──
    if (to.path.startsWith('/cidadao')) return true

    // ── 4. Sem sessão → login ──
    if (!estáAutenticado) return { path: '/login' }

    // ── 5. Verificação de perfil ──
    const perfisPermitidos = to.meta.perfis as Perfil[] | undefined
    if (perfisPermitidos && auth.perfil) {
      if (!perfisPermitidos.includes(auth.perfil)) {
        return { path: auth.rotaInicial }
      }
    }

    return true
  })

  return router
}