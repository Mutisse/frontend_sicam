// src/services/chefe/escalas.service.ts
import http from '@/boot/axios'

export type EstadoEscala = 'Rascunho' | 'Publicada'
export type TurnoEscala = 'Manhã' | 'Tarde' | 'Noite'

export interface Atribuicao {
  dia: string
  ativo: boolean
  turno: TurnoEscala
}

export interface Escala {
  id: string
  agenteId: string
  agente: string
  nSerie: string
  posto: string
  semana: string
  estado: EstadoEscala
  atribuicoes: Atribuicao[]
  notas: string | null
  criadoEm: string
}

export interface EscalasKpis {
  total: number
  publicadas: number
  rascunhos: number
  cobertura: number
}

export interface RespostaEscalas {
  items: Escala[]
  kpis: EscalasKpis
}

export interface CriarEscalaPayload {
  agente_id: number | string
  posto: string
  semana: string
  estado?: EstadoEscala | undefined
  atribuicoes: Atribuicao[]
  notas?: string | undefined
}

export interface FiltrosExport {
  estado?: string
  posto?: string
}

export const escalasService = {
  // ------------------------------------------------------
  // CRUD
  // ------------------------------------------------------
  async listar(): Promise<RespostaEscalas> {
    const { data } = await http.get<RespostaEscalas>('/api/chefe/escalas')
    return data
  },

  async criar(payload: CriarEscalaPayload): Promise<{ id: string; escala: Escala }> {
    const { data } = await http.post<{ id: string; escala: Escala }>(
      '/api/chefe/escalas',
      payload,
    )
    return data
  },

  async obter(id: string): Promise<Escala> {
    const { data } = await http.get<Escala>(`/api/chefe/escalas/${id}`)
    return data
  },

  async actualizar(
    id: string,
    payload: Partial<CriarEscalaPayload>,
  ): Promise<{ id: string; escala: Escala }> {
    const { data } = await http.put<{ id: string; escala: Escala }>(
      `/api/chefe/escalas/${id}`,
      payload,
    )
    return data
  },

  async remover(id: string): Promise<{ ok: boolean }> {
    const { data } = await http.delete<{ ok: boolean }>(`/api/chefe/escalas/${id}`)
    return data
  },

  async publicar(id: string): Promise<{ id: string; escala: Escala }> {
    const { data } = await http.put<{ id: string; escala: Escala }>(
      `/api/chefe/escalas/${id}/publicar`,
    )
    return data
  },

  // ------------------------------------------------------
  // Exportar
  // ------------------------------------------------------
  async exportarXlsx(filtros: FiltrosExport = {}): Promise<Blob> {
    const { data } = await http.get('/api/chefe/escalas/xlsx', {
      params: filtros,
      responseType: 'blob',
      headers: {
        Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    })
    return data as Blob
  },

  async exportarPdf(filtros: FiltrosExport = {}): Promise<Blob> {
    const { data } = await http.get('/api/chefe/escalas/pdf', {
      params: filtros,
      responseType: 'blob',
      headers: {
        Accept: 'application/pdf',
      },
    })
    return data as Blob
  },
}