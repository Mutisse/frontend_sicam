// src/services/inatro/agendamentos.service.ts
import http from '@/boot/axios'

export type EstadoAgendamento =
  | 'Pendente'
  | 'Confirmado'
  | 'Cancelado'
  | 'Concluído'

export interface Agendamento {
  id: string
  codigo: string
  matricula: string
  marca: string
  modelo: string
  proprietario: string
  nif: string
  telefone: string
  data: string
  data_raw: string | null
  hora: string
  duracao: number
  tipo: string
  posto: string
  inspetor: string
  estado: EstadoAgendamento
  observacoes: string | null
  criadoEm: string
}

export interface AgendamentosKpis {
  hoje: number
  semana: number
  confirmados: number
  cancelados: number
  concluidos: number
  pendentes: number
}

export interface RespostaAgendamentos {
  items: Agendamento[]
  kpis: AgendamentosKpis
}

export interface CriarAgendamentoPayload {
  matricula: string
  marca: string
  modelo: string
  proprietario: string
  nif: string
  telefone?: string | undefined
  data: string
  hora: string
  duracao: number
  tipo: string
  posto: string
  inspetor: string
  observacoes?: string | undefined
}

export const agendamentosService = {
  async listar(): Promise<RespostaAgendamentos> {
    const { data } = await http.get<RespostaAgendamentos>('/api/agendamentos')
    return data
  },

  async kpis(): Promise<AgendamentosKpis> {
    const { data } = await http.get<AgendamentosKpis>('/api/agendamentos/kpis')
    return data
  },

  async criar(payload: CriarAgendamentoPayload): Promise<{
    id: string
    codigo: string
    kpis: AgendamentosKpis
  }> {
    const { data } = await http.post<{
      id: string
      codigo: string
      kpis: AgendamentosKpis
    }>('/api/agendamentos', payload)
    return data
  },

  async obter(id: string): Promise<Agendamento> {
    const { data } = await http.get<Agendamento>(`/api/agendamentos/${id}`)
    return data
  },

  async confirmar(id: string) {
    const { data } = await http.put(`/api/agendamentos/${id}/confirmar`)
    return data as { id: string; estado: string; kpis: AgendamentosKpis }
  },

  async concluir(id: string) {
    const { data } = await http.put(`/api/agendamentos/${id}/concluir`)
    return data as { id: string; estado: string; kpis: AgendamentosKpis }
  },

  async cancelar(id: string) {
    const { data } = await http.put(`/api/agendamentos/${id}/cancelar`)
    return data as { id: string; estado: string; kpis: AgendamentosKpis }
  },

  async remover(id: string) {
    const { data } = await http.delete(`/api/agendamentos/${id}`)
    return data as { ok: boolean; kpis: AgendamentosKpis }
  },
}