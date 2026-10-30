// src/services/admin/utilizadores.service.ts
import http from '@/boot/axios'

export type EstadoUtilizador = 'Ativo' | 'Bloqueado'
export type PerfilKey =
  | 'admin'
  | 'chefe'
  | 'agente'
  | 'inatro'
  | 'gestmul'
  | 'issm'
  | 'prm'
  | 'cidadao'

export interface Utilizador {
  id: string
  nome: string
  email: string
  numeroId: string | null
  perfil: PerfilKey
  perfilLabel: string
  posto: string
  funcao: string
  estado: EstadoUtilizador
  ultimoAcesso: string
  telefone: string | null
}

export interface Perfil {
  id: string
  key: PerfilKey
  label: string
  descricao: string
  icon: string
  cor: string
}

export interface UtilizadoresKpis {
  total: number
  activos: number
  bloqueados: number
  online: number
}

export interface RespostaUtilizadores {
  items: Utilizador[]
  kpis: UtilizadoresKpis
  perfis: Perfil[]
  postos: string[]
}

export interface CriarUtilizadorPayload {
  nome: string
  email: string
  telefone?: string | undefined
  perfil: PerfilKey
  posto: string
  estado?: EstadoUtilizador | undefined
  senha: string
  forcarAlteracao?: boolean | undefined
}

export interface ActualizarUtilizadorPayload {
  nome?: string | undefined
  email?: string | undefined
  telefone?: string | undefined
  perfil?: PerfilKey | undefined
  posto?: string | undefined
  estado?: EstadoUtilizador | undefined
}

export const utilizadoresService = {
  async listar(): Promise<RespostaUtilizadores> {
    const { data } = await http.get<RespostaUtilizadores>(
      '/api/admin/utilizadores',
    )
    return data
  },

  async obter(id: string): Promise<Utilizador> {
    const { data } = await http.get<Utilizador>(
      `/api/admin/utilizadores/${id}`,
    )
    return data
  },

  async criar(
    payload: CriarUtilizadorPayload,
  ): Promise<{ id: string; utilizador: Utilizador; kpis: UtilizadoresKpis }> {
    const { data } = await http.post<{
      id: string
      utilizador: Utilizador
      kpis: UtilizadoresKpis
    }>('/api/admin/utilizadores', payload)
    return data
  },

  async actualizar(
    id: string,
    payload: ActualizarUtilizadorPayload,
  ): Promise<{ id: string; utilizador: Utilizador; kpis: UtilizadoresKpis }> {
    const { data } = await http.put<{
      id: string
      utilizador: Utilizador
      kpis: UtilizadoresKpis
    }>(`/api/admin/utilizadores/${id}`, payload)
    return data
  },

  async remover(id: string): Promise<{ ok: boolean; kpis: UtilizadoresKpis }> {
    const { data } = await http.delete<{ ok: boolean; kpis: UtilizadoresKpis }>(
      `/api/admin/utilizadores/${id}`,
    )
    return data
  },

  async bloquear(
    id: string,
  ): Promise<{ id: string; utilizador: Utilizador; kpis: UtilizadoresKpis }> {
    const { data } = await http.put<{
      id: string
      utilizador: Utilizador
      kpis: UtilizadoresKpis
    }>(`/api/admin/utilizadores/${id}/bloquear`)
    return data
  },

  async activar(
    id: string,
  ): Promise<{ id: string; utilizador: Utilizador; kpis: UtilizadoresKpis }> {
    const { data } = await http.put<{
      id: string
      utilizador: Utilizador
      kpis: UtilizadoresKpis
    }>(`/api/admin/utilizadores/${id}/activar`)
    return data
  },

  async alterarSenha(
    id: string,
    senha: string,
    forcarAlteracao = true,
  ): Promise<{ ok: boolean; id: string }> {
    const { data } = await http.put<{ ok: boolean; id: string }>(
      `/api/admin/utilizadores/${id}/senha`,
      { senha, forcarAlteracao },
    )
    return data
  },

  async exportarXlsx(): Promise<Blob> {
    const { data } = await http.get('/api/admin/utilizadores/xlsx', {
      responseType: 'blob',
      headers: {
        Accept:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    })
    return data as Blob
  },
}