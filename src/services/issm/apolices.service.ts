// src/services/issm/apolices.service.ts
import http from '@/boot/axios'

export type EstadoApolice = 'Activa' | 'A expirar' | 'Expirada' | 'Anulada'
export type TipoApolice = 'Terceiros' | 'Terceiros + Roubo' | 'Todos os riscos'

export interface Apolice {
  id: string
  numero: string
  matricula: string
  marca: string
  modelo: string
  segurado: string
  nif: string
  telefone: string | null
  email: string | null
  seguradora: string
  tipo: TipoApolice
  inicio: string
  fim: string
  premio: number
  estado: EstadoApolice
  observacoes: string | null
  criadoEm: string
}

export interface ApolicesKpis {
  total: number
  activas: number
  aExpirar: number
  expiradas: number
  anuladas: number
  premioTotal: number
}

export interface RespostaApolices {
  items: Apolice[]
  kpis: ApolicesKpis
}

export interface CriarApolicePayload {
  numero: string
  matricula: string
  segurado: string
  nif: string
  telefone?: string | undefined
  email?: string | undefined
  seguradora: string
  tipo: TipoApolice
  inicio: string
  fim: string
  premio: number
  estado?: EstadoApolice | undefined
  observacoes?: string | undefined
}

export interface FiltrosExport {
  seguradora?: string
  tipo?: string
  estado?: string
}

export const apolicesService = {
  async listar(): Promise<RespostaApolices> {
    const { data } = await http.get<RespostaApolices>('/api/issm/apolices')
    return data
  },

  async criar(payload: CriarApolicePayload): Promise<{ id: string; apolice: Apolice }> {
    const { data } = await http.post<{ id: string; apolice: Apolice }>(
      '/api/issm/apolices',
      payload,
    )
    return data
  },

  async obter(id: string): Promise<Apolice> {
    const { data } = await http.get<Apolice>(`/api/issm/apolices/${id}`)
    return data
  },

  async actualizar(
    id: string,
    payload: Partial<CriarApolicePayload>,
  ): Promise<{ id: string; apolice: Apolice }> {
    const { data } = await http.put<{ id: string; apolice: Apolice }>(
      `/api/issm/apolices/${id}`,
      payload,
    )
    return data
  },

  async remover(id: string): Promise<{ ok: boolean }> {
    const { data } = await http.delete<{ ok: boolean }>(`/api/issm/apolices/${id}`)
    return data
  },

  async exportarXlsx(filtros: FiltrosExport = {}): Promise<Blob> {
    const { data } = await http.get('/api/issm/apolices/xlsx', {
      params: filtros,
      responseType: 'blob',
      headers: {
        Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    })
    return data as Blob
  },

  async exportarPdf(filtros: FiltrosExport = {}): Promise<Blob> {
    const { data } = await http.get('/api/issm/apolices/pdf', {
      params: filtros,
      responseType: 'blob',
      headers: { Accept: 'application/pdf' },
    })
    return data as Blob
  },
}