// src/services/issm/seguradoras.service.ts
import http from '@/boot/axios'

export type EstadoSeguradora = 'Activa' | 'Suspensa' | 'Inactiva'
export type CategoriaSeguradora = 'Nacional' | 'Internacional' | 'Mútua'

export interface Seguradora {
  id: string
  codigo: string
  sigla: string
  nome: string
  nif: string
  categoria: CategoriaSeguradora
  email: string
  telefone: string
  website: string | null
  endereco: string
  cidade: string
  provincia: string
  responsavel: string
  contactoResponsavel: string
  numeroApoles: number
  numeroSinistros: number
  estado: EstadoSeguradora
  observacoes: string | null
  registadaEm: string
}

export interface SeguradorasKpis {
  total: number
  activas: number
  suspensas: number
  inactivas: number
  totalApoles: number
  totalSinistros: number
}

export interface RespostaSeguradoras {
  items: Seguradora[]
  kpis: SeguradorasKpis
}

export interface CriarSeguradoraPayload {
  codigo: string
  sigla: string
  nome: string
  nif: string
  categoria: CategoriaSeguradora
  email: string
  telefone: string
  website?: string | undefined
  endereco: string
  cidade: string
  provincia: string
  responsavel: string
  contactoResponsavel?: string | undefined
  estado?: EstadoSeguradora | undefined
  observacoes?: string | undefined
}

export interface FiltrosExport {
  categoria?: string
  estado?: string
  provincia?: string
}

export const seguradorasService = {
  async listar(): Promise<RespostaSeguradoras> {
    const { data } = await http.get<RespostaSeguradoras>('/api/issm/seguradoras')
    return data
  },

  async criar(payload: CriarSeguradoraPayload): Promise<{ id: string; seguradora: Seguradora; kpis: SeguradorasKpis }> {
    const { data } = await http.post<{ id: string; seguradora: Seguradora; kpis: SeguradorasKpis }>(
      '/api/issm/seguradoras',
      payload,
    )
    return data
  },

  async obter(id: string): Promise<Seguradora> {
    const { data } = await http.get<Seguradora>(`/api/issm/seguradoras/${id}`)
    return data
  },

  async actualizar(
    id: string,
    payload: Partial<CriarSeguradoraPayload>,
  ): Promise<{ id: string; seguradora: Seguradora; kpis: SeguradorasKpis }> {
    const { data } = await http.put<{ id: string; seguradora: Seguradora; kpis: SeguradorasKpis }>(
      `/api/issm/seguradoras/${id}`,
      payload,
    )
    return data
  },

  async remover(id: string): Promise<{ ok: boolean; kpis: SeguradorasKpis }> {
    const { data } = await http.delete<{ ok: boolean; kpis: SeguradorasKpis }>(`/api/issm/seguradoras/${id}`)
    return data
  },

  async activar(id: string): Promise<{ id: string; seguradora: Seguradora; kpis: SeguradorasKpis }> {
    const { data } = await http.put<{ id: string; seguradora: Seguradora; kpis: SeguradorasKpis }>(
      `/api/issm/seguradoras/${id}/activar`,
    )
    return data
  },

  async suspender(id: string): Promise<{ id: string; seguradora: Seguradora; kpis: SeguradorasKpis }> {
    const { data } = await http.put<{ id: string; seguradora: Seguradora; kpis: SeguradorasKpis }>(
      `/api/issm/seguradoras/${id}/suspender`,
    )
    return data
  },

  async inactivar(id: string): Promise<{ id: string; seguradora: Seguradora; kpis: SeguradorasKpis }> {
    const { data } = await http.put<{ id: string; seguradora: Seguradora; kpis: SeguradorasKpis }>(
      `/api/issm/seguradoras/${id}/inactivar`,
    )
    return data
  },

  async exportarXlsx(filtros: FiltrosExport = {}): Promise<Blob> {
    const { data } = await http.get('/api/issm/seguradoras/xlsx', {
      params: filtros,
      responseType: 'blob',
      headers: {
        Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    })
    return data as Blob
  },

  async exportarPdf(filtros: FiltrosExport = {}): Promise<Blob> {
    const { data } = await http.get('/api/issm/seguradoras/pdf', {
      params: filtros,
      responseType: 'blob',
      headers: { Accept: 'application/pdf' },
    })
    return data as Blob
  },
}