// src/services/chefe/patrulhas.service.ts
import http from '@/boot/axios'

export type EstadoPatrulha = 'Planeada' | 'Em curso' | 'Concluída' | 'Cancelada'
export type PrioridadePatrulha = 'Baixa' | 'Média' | 'Alta'
export type TurnoPatrulha = 'Manhã' | 'Tarde' | 'Noite'

export interface Paragem {
  id?: string
  local: string
  hora: string
  resultado: string
}

export interface Patrulha {
  id: string
  codigo: string
  nome: string
  data: string
  horaInicio: string
  horaFim: string
  turno: TurnoPatrulha
  agente: string
  agenteId: string
  viatura: string
  zona: string
  pontosPrevistos: number
  pontosConcluidos: number
  prioridade: PrioridadePatrulha
  estado: EstadoPatrulha
  paragens: Paragem[]
  notas: string | null
  criadoEm: string
}

export interface PatrulhasKpis {
  total: number
  planeadas: number
  emCurso: number
  concluidas: number
  canceladas: number
}

export interface RespostaPatrulhas {
  items: Patrulha[]
  kpis: PatrulhasKpis
}

export interface CriarPatrulhaPayload {
  nome: string
  data: string
  horaInicio: string
  horaFim?: string | undefined
  turno: TurnoPatrulha
  agente_id: string | number
  viatura?: string | undefined
  local: string
  prioridade: PrioridadePatrulha
  pontos_previstos: number
  estado?: EstadoPatrulha | undefined
  notas?: string | undefined
}

export interface FiltrosExport {
  estado?: string
  prioridade?: string
}

export const patrulhasService = {
  // ------------------------------------------------------
  // CRUD
  // ------------------------------------------------------
  async listar(): Promise<RespostaPatrulhas> {
    const { data } = await http.get<RespostaPatrulhas>('/api/chefe/patrulhas')
    return data
  },

  async criar(payload: CriarPatrulhaPayload): Promise<{ id: string; patrulha: Patrulha }> {
    const { data } = await http.post<{ id: string; patrulha: Patrulha }>(
      '/api/chefe/patrulhas',
      payload,
    )
    return data
  },

  async obter(id: string): Promise<Patrulha> {
    const { data } = await http.get<Patrulha>(`/api/chefe/patrulhas/${id}`)
    return data
  },

  async actualizar(
    id: string,
    payload: Partial<CriarPatrulhaPayload>,
  ): Promise<{ id: string; patrulha: Patrulha }> {
    const { data } = await http.put<{ id: string; patrulha: Patrulha }>(
      `/api/chefe/patrulhas/${id}`,
      payload,
    )
    return data
  },

  async remover(id: string): Promise<{ ok: boolean }> {
    const { data } = await http.delete<{ ok: boolean }>(`/api/chefe/patrulhas/${id}`)
    return data
  },

  // ------------------------------------------------------
  // Ações de estado
  // ------------------------------------------------------
  async iniciar(id: string): Promise<{ id: string; patrulha: Patrulha }> {
    const { data } = await http.put<{ id: string; patrulha: Patrulha }>(
      `/api/chefe/patrulhas/${id}/iniciar`,
    )
    return data
  },

  async concluir(id: string): Promise<{ id: string; patrulha: Patrulha }> {
    const { data } = await http.put<{ id: string; patrulha: Patrulha }>(
      `/api/chefe/patrulhas/${id}/concluir`,
    )
    return data
  },

  async cancelar(id: string): Promise<{ id: string; patrulha: Patrulha }> {
    const { data } = await http.put<{ id: string; patrulha: Patrulha }>(
      `/api/chefe/patrulhas/${id}/cancelar`,
    )
    return data
  },

  // ------------------------------------------------------
  // Exportar
  // ------------------------------------------------------
  async exportarXlsx(filtros: FiltrosExport = {}): Promise<Blob> {
    const { data } = await http.get('/api/chefe/patrulhas/xlsx', {
      params: filtros,
      responseType: 'blob',
      headers: {
        Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    })
    return data as Blob
  },

  async exportarPdf(filtros: FiltrosExport = {}): Promise<Blob> {
    const { data } = await http.get('/api/chefe/patrulhas/pdf', {
      params: filtros,
      responseType: 'blob',
      headers: {
        Accept: 'application/pdf',
      },
    })
    return data as Blob
  },
}