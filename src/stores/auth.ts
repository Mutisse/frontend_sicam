// src/stores/auth.ts
import { defineStore } from 'pinia'
import type { Perfil as PerfilKey } from '@/css/design/palette'
import { ROTA_INICIAL } from '@/modules/desktop/config/menus'
import { authService, type Utilizador } from '@/services/auth.service'
import { extrairErro, resetCsrf } from '@/boot/axios'

export type { Utilizador }

interface AuthState {
  utilizador: Utilizador | null
  perfil: PerfilKey | null
  aCarregar: boolean
  erro: string | null
  _restaurado: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    utilizador: null,
    perfil: null,
    aCarregar: false,
    erro: null,
    _restaurado: false,
  }),

  getters: {
    autenticado: (s): boolean => !!s.utilizador,

    isAdmin:   (s) => s.perfil === 'admin',
    isChefe:   (s) => s.perfil === 'chefe',
    isInatro:  (s) => s.perfil === 'inatro',
    isGestmul: (s) => s.perfil === 'gestmul',
    isIssm:    (s) => s.perfil === 'issm',
    isPrm:     (s) => s.perfil === 'prm',
    isAgente:  (s) => s.perfil === 'agente',
    isCidadao: (s) => s.perfil === 'cidadao',

    iniciais: (s) => {
      if (s.utilizador?.iniciais) return s.utilizador.iniciais
      if (!s.utilizador?.nome) return '?'
      const partes = s.utilizador.nome.trim().split(/\s+/)
      const p = partes[0]?.[0] ?? ''
      const u = partes.length > 1 ? (partes[partes.length - 1]?.[0] ?? '') : ''
      return (p + u).toUpperCase()
    },

    rotaInicial: (s): string => {
      if (!s.perfil) return '/login'
      return ROTA_INICIAL[s.perfil] ?? '/login'
    },
  },

  actions: {
    // ----------------------------------------------------------
    // LOGIN
    // ----------------------------------------------------------
    async login(email: string, senha: string): Promise<boolean> {
      this.aCarregar = true
      this.erro = null

      try {
        const { utilizador } = await authService.login(email, senha)
        this.utilizador = utilizador
        this.perfil = utilizador.perfil_key as PerfilKey
        return true
      } catch (e) {
        this.erro = extrairErro(e)
        return false
      } finally {
        this.aCarregar = false
      }
    },

    // ----------------------------------------------------------
    // LOGOUT — limpa TUDO
    // ----------------------------------------------------------
    async logout(): Promise<void> {
      try {
        await authService.logout()
      } catch {
        /* ignorar — limpamos localmente na mesma */
      } finally {
        // ⭐ Limpar estado
        this.utilizador = null
        this.perfil = null
        this.erro = null
        this._restaurado = false   // ⭐ próximo login vai restaurar

        // ⭐ Reset do CSRF (próximo login obtém novo)
        resetCsrf()
      }
    },

    // ----------------------------------------------------------
    // RESTAURAR
    // ----------------------------------------------------------
    async restaurar(): Promise<void> {
      if (this._restaurado) return
      this._restaurado = true

      try {
        const { utilizador } = await authService.me()
        this.utilizador = utilizador
        this.perfil = utilizador.perfil_key as PerfilKey
      } catch {
        this.utilizador = null
        this.perfil = null
      }
    },

    setUtilizador(u: Utilizador) {
      this.utilizador = u
      this.perfil = u.perfil_key as PerfilKey
    },
  },
})