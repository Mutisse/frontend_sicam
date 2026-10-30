// src/services/admin/perfis.service.ts
import http from '@/boot/axios'

export type ModuloKey =
  | 'dashboard'
  | 'monitorizacao'
  | 'relatorios'
  | 'backups'
  | 'utilizadores'
  | 'postos'
  | 'dispositivos'
  | 'integracoes'
  | 'auditoria'
  | 'hotlist'
  | 'abordagens'
  | 'alertas'
  | 'mapa'
  | 'perfis'

export type AcaoKey = 'ver' | 'criar' | 'editar' | 'apagar'
export type EstadoPerfil = 'Ativo' | 'Bloqueado'

export interface Permissao {
  modulo: ModuloKey
  ver: boolean
  criar: boolean
  editar: boolean
  apagar: boolean
}

export interface Perfil {
  id: string
  key: string
  label: string
  descricao: string
  icon: string
  cor: string
  estado: EstadoPerfil
  sistema: boolean
  utilizadores: number
  permissoes: Permissao[]
}

export interface Acao {
  key: AcaoKey
  label: string
}

export interface RespostaPerfis {
  items: Perfil[]
  acoes: Acao[]
}

export interface CriarPerfilPayload {
  key: string
  label: string
  descricao?: string | undefined
  icon: string
  cor: string
  estado?: EstadoPerfil | undefined
  permissoes: Permissao[]
}

export interface ActualizarPerfilPayload {
  key?: string | undefined
  label?: string | undefined
  descricao?: string | undefined
  icon?: string | undefined
  cor?: string | undefined
  estado?: EstadoPerfil | undefined
  permissoes?: Permissao[] | undefined
}

export const perfisService = {
  async listar(): Promise<RespostaPerfis> {
    const { data } = await http.get<RespostaPerfis>('/api/admin/perfis')
    return data
  },

  async obter(id: string): Promise<Perfil> {
    const { data } = await http.get<Perfil>(`/api/admin/perfis/${id}`)
    return data
  },

  async criar(
    payload: CriarPerfilPayload,
  ): Promise<{ id: string; perfil: Perfil }> {
    const { data } = await http.post<{ id: string; perfil: Perfil }>(
      '/api/admin/perfis',
      payload,
    )
    return data
  },

  async actualizar(
    id: string,
    payload: ActualizarPerfilPayload,
  ): Promise<{ id: string; perfil: Perfil }> {
    const { data } = await http.put<{ id: string; perfil: Perfil }>(
      `/api/admin/perfis/${id}`,
      payload,
    )
    return data
  },

  async remover(id: string): Promise<{ ok: boolean }> {
    const { data } = await http.delete<{ ok: boolean }>(
      `/api/admin/perfis/${id}`,
    )
    return data
  },

  async clonar(id: string): Promise<{ id: string; perfil: Perfil }> {
    const { data } = await http.post<{ id: string; perfil: Perfil }>(
      `/api/admin/perfis/${id}/clonar`,
    )
    return data
  },

  async bloquear(id: string): Promise<{ id: string; perfil: Perfil }> {
    const { data } = await http.put<{ id: string; perfil: Perfil }>(
      `/api/admin/perfis/${id}/bloquear`,
    )
    return data
  },

  async activar(id: string): Promise<{ id: string; perfil: Perfil }> {
    const { data } = await http.put<{ id: string; perfil: Perfil }>(
      `/api/admin/perfis/${id}/activar`,
    )
    return data
  },

  async exportarXlsx(): Promise<Blob> {
    const { data } = await http.get('/api/admin/perfis/xlsx', {
      responseType: 'blob',
      headers: {
        Accept:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    })
    return data as Blob
  },
}