// src/services/chefe/agentes.service.ts
import http from '@/boot/axios'

export type EstadoAgente = 'Online' | 'Em patrulha' | 'Offline' | 'Inactivo'
export type TurnoAgente = 'Manhã' | 'Tarde' | 'Noite' | '—'

export interface Agente {
  id: string
  nome: string
  email: string
  telefone: string
  nSerie: string
  turno: string
  viatura: string
  posto: string
  estado: EstadoAgente
  ultimaSinc: string
  consultasHoje: number
  multasEmitidas: number
  admissao: string
  observacoes: string | null
  criadoEm: string
}

export interface AgentesKpis {
  total: number
  online: number
  emPatrulha: number
  offline: number
  inactivos: number
}

export interface RespostaAgentes {
  items: Agente[]
  kpis: AgentesKpis
}

export interface CriarAgentePayload {
  nome: string
  email: string
  telefone?: string | undefined
  nSerie: string
  posto: string
  password?: string | undefined
}

export const agentesService = {
  async listar(): Promise<RespostaAgentes> {
    const { data } = await http.get<RespostaAgentes>('/api/chefe/agentes')
    return data
  },

  async criar(payload: CriarAgentePayload): Promise<{ id: string; agente: Agente }> {
    const { data } = await http.post<{ id: string; agente: Agente }>(
      '/api/chefe/agentes',
      payload,
    )
    return data
  },

  async obter(id: string): Promise<Agente> {
    const { data } = await http.get<Agente>(`/api/chefe/agentes/${id}`)
    return data
  },

  async actualizar(
    id: string,
    payload: Partial<CriarAgentePayload>,
  ): Promise<{ id: string; agente: Agente }> {
    const { data } = await http.put<{ id: string; agente: Agente }>(
      `/api/chefe/agentes/${id}`,
      payload,
    )
    return data
  },

  async remover(id: string): Promise<{ ok: boolean }> {
    const { data } = await http.delete<{ ok: boolean }>(`/api/chefe/agentes/${id}`)
    return data
  },

  async activar(id: string): Promise<{ id: string; agente: Agente }> {
    const { data } = await http.put<{ id: string; agente: Agente }>(
      `/api/chefe/agentes/${id}/activar`,
    )
    return data
  },

  async desactivar(id: string): Promise<{ id: string; agente: Agente }> {
    const { data } = await http.put<{ id: string; agente: Agente }>(
      `/api/chefe/agentes/${id}/desactivar`,
    )
    return data
  },
}