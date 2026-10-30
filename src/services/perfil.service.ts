// src/services/perfil.service.ts
import http from '@/boot/axios'
import type { Utilizador } from './auth.service'

// ============================================================
// Tipos
// ============================================================
export interface SessaoActiva {
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

// ============================================================
// Serviço
// ============================================================
export const perfilService = {
  // ─── Dados pessoais ─────────────────────────────────────
  async obter(): Promise<Utilizador> {
    const { data } = await http.get<{ utilizador: Utilizador }>('/api/perfil')
    return data.utilizador
  },

  async actualizar(dados: Partial<Utilizador>): Promise<Utilizador> {
    const { data } = await http.put<{ utilizador: Utilizador }>(
      '/api/perfil',
      dados,
    )
    return data.utilizador
  },

  // ─── Senha ──────────────────────────────────────────────
  async alterarSenha(dados: {
    senha_atual: string
    senha_nova: string
    senha_nova_confirmation: string
  }): Promise<void> {
    await http.put('/api/perfil/senha', dados)
  },

  // ─── Sessões ────────────────────────────────────────────
  async listarSessoes(): Promise<SessaoActiva[]> {
    const { data } = await http.get<{ sessoes: SessaoActiva[] }>(
      '/api/perfil/sessoes',
    )
    return data.sessoes
  },

  async terminarSessao(id: string): Promise<void> {
    await http.delete(`/api/perfil/sessoes/${id}`)
  },

  async terminarOutrasSessoes(): Promise<void> {
    await http.delete('/api/perfil/sessoes/outras')
  },

  // ─── Preferências ───────────────────────────────────────
  async obterPreferencias(): Promise<Preferencias> {
    const { data } = await http.get<{ preferencias: Preferencias }>(
      '/api/perfil/preferencias',
    )
    return data.preferencias
  },

  async guardarPreferencias(prefs: Preferencias): Promise<void> {
    await http.put('/api/perfil/preferencias', prefs)
  },

  // ─── Foto ───────────────────────────────────────────────
  async uploadFoto(ficheiro: File): Promise<string> {
    const form = new FormData()
    form.append('foto', ficheiro)

    const { data } = await http.post<{ foto_url: string }>(
      '/api/perfil/foto',
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    )
    return data.foto_url
  },
}