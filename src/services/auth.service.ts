// src/services/auth.service.ts
import http from '@/boot/axios'

// ============================================================
// Tipos
// ============================================================
export interface Perfil {
  id: number
  key: string
  label: string
  descricao: string
  icon: string
  cor: string
  estado: 'Ativo' | 'Bloqueado'
  sistema: boolean
}

export interface Preferencias {
  tema: 'claro' | 'escuro' | 'auto'
  idioma: 'pt' | 'en'
  densidade: 'normal' | 'compacta'
  modo_offline: boolean
  notif_push: boolean
  notif_som: boolean
  notif_email: boolean
}

export interface Utilizador {
  id: number
  nome: string
  email: string
  telefone?: string | null
  posto?: string | null
  funcao?: string | null
  numero_id?: string | null
  perfil: Perfil
  perfil_key: string
  foto_url?: string | null
  estado: 'Ativo' | 'Bloqueado'
  ultimo_acesso?: string | null
  iniciais?: string
  preferencias?: Preferencias
}

export interface LoginResponse {
  utilizador: Utilizador
  token: string
}

export interface MeResponse {
  utilizador: Utilizador
}

// ============================================================
// Serviço
// ============================================================
export const authService = {
  async login(email: string, senha: string): Promise<LoginResponse> {
    const { data } = await http.post<LoginResponse>('/api/auth/login', {
      email: email.trim(),
      senha,
    })

    return data
  },

  async logout(): Promise<void> {
    await http.post('/api/auth/logout')
  },

  async me(): Promise<MeResponse> {
    const { data } = await http.get<MeResponse>('/api/auth/me')
    return data
  },
}