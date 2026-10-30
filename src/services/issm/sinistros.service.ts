// src/services/issm/sinistros.service.ts
import http from '@/boot/axios'

export type EstadoSinistro = 'Aberto' | 'Em análise' | 'Resolvido' | 'Recusado'
export type TipoSinistro = 'Colisão' | 'Furto' | 'Incêndio' | 'Inundação' | 'Vandalismo'
export type GravidadeSinistro = 'Leve' | 'Moderado' | 'Grave'

export interface Sinistro {
  id: string
  numero: string
  matricula: string
  apolice: string
  segurado: string
  seguradora: string
  tipo: TipoSinistro
  gravidade: GravidadeSinistro
  data: string
  local: string
  descricao: string
  valorEstimado: number
  valorAprovado: number | null
  estado: EstadoSinistro
  responsavel: string
  observacoes: string | null
  criadoEm: string
}

export interface SinistrosKpis {
  total: number
  abertos: number
  emAnalise: number
  resolvidos: number
  recusados: number
  valorTotal: number
  valorAprovado: number
}

export interface RespostaSinistros {
  items: Sinistro[]
  kpis: SinistrosKpis
}

export interface CriarSinistroPayload {
  numero: string
  matricula: string
  apolice?: string | undefined
  segurado: string
  seguradora: string
  tipo: TipoSinistro
  gravidade: GravidadeSinistro
  data: string
  local: string
  descricao: string
  valorEstimado: number
  valorAprovado?: number | undefined
  estado?: EstadoSinistro | undefined
  responsavel: string
  observacoes?: string | undefined
}

export interface FiltrosExport {
  tipo?: string
  estado?: string
  gravidade?: string
  seguradora?: string
}

export const sinistrosService = {
  async listar(): Promise<RespostaSinistros> {
    const { data } = await http.get<RespostaSinistros>('/api/issm/sinistros')
    return data
  },

  async criar(payload: CriarSinistroPayload): Promise<{ id: string; sinistro: Sinistro }> {
    const { data } = await http.post<{ id: string; sinistro: Sinistro }>(
      '/api/issm/sinistros',
      payload,
    )
    return data
  },

  async obter(id: string): Promise<Sinistro> {
    const { data } = await http.get<Sinistro>(`/api/issm/sinistros/${id}`)
    return data
  },

  async actualizar(
    id: string,
    payload: Partial<CriarSinistroPayload>,
  ): Promise<{ id: string; sinistro: Sinistro }> {
    const { data } = await http.put<{ id: string; sinistro: Sinistro }>(
      `/api/issm/sinistros/${id}`,
      payload,
    )
    return data
  },

  async remover(id: string): Promise<{ ok: boolean }> {
    const { data } = await http.delete<{ ok: boolean }>(`/api/issm/sinistros/${id}`)
    return data
  },

  async marcarEmAnalise(id: string): Promise<{ id: string; sinistro: Sinistro }> {
    const { data } = await http.put<{ id: string; sinistro: Sinistro }>(
      `/api/issm/sinistros/${id}/em-analise`,
    )
    return data
  },

  async marcarResolvido(
    id: string,
    valorAprovado?: number,
  ): Promise<{ id: string; sinistro: Sinistro }> {
    const { data } = await http.put<{ id: string; sinistro: Sinistro }>(
      `/api/issm/sinistros/${id}/resolvido`,
      { valorAprovado },
    )
    return data
  },

  async recusar(id: string): Promise<{ id: string; sinistro: Sinistro }> {
    const { data } = await http.put<{ id: string; sinistro: Sinistro }>(
      `/api/issm/sinistros/${id}/recusado`,
    )
    return data
  },

  async exportarXlsx(filtros: FiltrosExport = {}): Promise<Blob> {
    const { data } = await http.get('/api/issm/sinistros/xlsx', {
      params: filtros,
      responseType: 'blob',
      headers: {
        Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    })
    return data as Blob
  },

  async exportarPdf(filtros: FiltrosExport = {}): Promise<Blob> {
    const { data } = await http.get('/api/issm/sinistros/pdf', {
      params: filtros,
      responseType: 'blob',
      headers: { Accept: 'application/pdf' },
    })
    return data as Blob
  },
}