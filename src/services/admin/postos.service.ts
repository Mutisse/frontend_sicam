// src/services/admin/postos.service.ts
import http from '@/boot/axios'

export interface Posto {
  id: string
  codigo: string
  nome: string
  provincia: string
  distrito: string
  agentes: number
  criticos: number
  cor: string
  endereco: string | null
  telefone: string | null
  notas: string | null
  estado: 'Ativo' | 'Bloqueado'
}

export interface PostosKpis {
  total: number
  agentes: number
  criticos: number
  provincias: number
}

export interface RespostaPostos {
  items: Posto[]
  kpis: PostosKpis
}

export interface CriarPostoPayload {
  codigo: string
  nome: string
  provincia: string
  cor?: string | undefined
  endereco?: string | undefined
  telefone?: string | undefined
  notas?: string | undefined
}

export interface ActualizarPostoPayload {
  codigo?: string | undefined
  nome?: string | undefined
  provincia?: string | undefined
  cor?: string | undefined
  endereco?: string | undefined
  telefone?: string | undefined
  notas?: string | undefined
}

export const postosService = {
  async listar(): Promise<RespostaPostos> {
    const { data } = await http.get<RespostaPostos>('/api/admin/postos')
    return data
  },

  async obter(id: string): Promise<Posto> {
    const { data } = await http.get<Posto>(`/api/admin/postos/${id}`)
    return data
  },

  async criar(
    payload: CriarPostoPayload,
  ): Promise<{ id: string; posto: Posto }> {
    const { data } = await http.post<{ id: string; posto: Posto }>(
      '/api/admin/postos',
      payload,
    )
    return data
  },

  async actualizar(
    id: string,
    payload: ActualizarPostoPayload,
  ): Promise<{ id: string; posto: Posto }> {
    const { data } = await http.put<{ id: string; posto: Posto }>(
      `/api/admin/postos/${id}`,
      payload,
    )
    return data
  },

  async remover(id: string): Promise<{ ok: boolean }> {
    const { data } = await http.delete<{ ok: boolean }>(
      `/api/admin/postos/${id}`,
    )
    return data
  },

  async exportarXlsx(): Promise<Blob> {
    const { data } = await http.get('/api/admin/postos/xlsx', {
      responseType: 'blob',
      headers: {
        Accept:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    })
    return data as Blob
  },
}