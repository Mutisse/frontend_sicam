// src/services/agente/perfil.service.ts
import http from '@/boot/axios'

export interface UtilizadorPerfil {
  id: string
  name: string
  email: string
  telefone: string | null
  numero_id: string | null
  posto: string | null
  funcao: string | null
  foto_url: string | null
  ultimo_acesso: string | null
  perfil?: {
    id: string
    key: string
    label: string
  }
}

export interface Sessao {
  id: string
  dispositivo: string
  local: string
  ultimo_acesso: string
  atual: boolean
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

export interface ActualizarPerfilPayload {
  nome?: string
  email?: string
  telefone?: string | null
}

export const perfilService = {
  // ── Dados ──────────────────────────────────────────
  async obter(): Promise<UtilizadorPerfil> {
    const { data } = await http.get<{ utilizador: UtilizadorPerfil }>('/api/perfil')
    return data.utilizador
  },

  async actualizar(payload: ActualizarPerfilPayload): Promise<UtilizadorPerfil> {
    const { data } = await http.put<{ utilizador: UtilizadorPerfil }>(
      '/api/perfil',
      payload,
    )
    return data.utilizador
  },

  // ── Senha ──────────────────────────────────────────
  async alterarSenha(senhaAtual: string, senhaNova: string): Promise<void> {
    await http.put('/api/perfil/senha', {
      senha_atual: senhaAtual,
      senha_nova: senhaNova,
      senha_nova_confirmation: senhaNova,
    })
  },

  // ── Sessões ────────────────────────────────────────
  async carregarSessoes(): Promise<Sessao[]> {
    const { data } = await http.get<{ sessoes: Sessao[] }>('/api/perfil/sessoes')
    return data.sessoes
  },

  async terminarSessao(id: string): Promise<void> {
    await http.delete(`/api/perfil/sessoes/${id}`)
  },

  async terminarOutrasSessoes(): Promise<void> {
    await http.delete('/api/perfil/sessoes/outras')
  },

  // ── Preferências ───────────────────────────────────
  async obterPreferencias(): Promise<Preferencias> {
    const { data } = await http.get<{ preferencias: Preferencias }>(
      '/api/perfil/preferencias',
    )
    return data.preferencias
  },

  async guardarPreferencias(prefs: Preferencias): Promise<void> {
    await http.put('/api/perfil/preferencias', prefs)
  },

  // ── Foto ───────────────────────────────────────────
  async uploadFoto(file: File): Promise<string> {
    const form = new FormData()
    form.append('foto', file)
    const { data } = await http.post<{ foto_url: string }>(
      '/api/perfil/foto',
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    )
    return data.foto_url
  },
}