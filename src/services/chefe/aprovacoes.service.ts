// src/services/chefe/aprovacoes.service.ts
import http from '@/boot/axios'

export type EstadoAprovacao = 'pendente' | 'aprovado' | 'rejeitado'
export type TipoAprovacao = 'auto' | 'dados-sensiveis' | 'apreensao'
export type TabAprovacao = 'pendentes' | 'aprovados' | 'rejeitados'
export type PrioridadeAprovacao = 'Baixa' | 'Média' | 'Alta' | 'Urgente'

export interface DetalheAprovacao {
  label: string
  valor: string
}

export interface Aprovacao {
  id: string
  codigo: string
  tipo: TipoAprovacao
  titulo: string
  matricula: string
  agente: string
  posto: string
  prioridade: PrioridadeAprovacao
  estado: EstadoAprovacao
  detalhes: DetalheAprovacao[]
  motivoRejeicao: string | null
  decididoPor: string | null
  decididoEm: string | null
  hora: string
  criadoEm: string
}

export interface AprovacoesKpis {
  pendentes: number
  aprovadosHoje: number
  rejeitadosHoje: number
  tempoMedio: number
}

export interface RespostaAprovacoes {
  items: Aprovacao[]
  kpis: AprovacoesKpis
}

export const aprovacoesService = {
  async listar(): Promise<RespostaAprovacoes> {
    const { data } = await http.get<RespostaAprovacoes>('/api/chefe/aprovacoes')
    return data
  },

  async obter(id: string): Promise<Aprovacao> {
    const { data } = await http.get<Aprovacao>(`/api/chefe/aprovacoes/${id}`)
    return data
  },

  async aprovar(
    id: string,
    decididoPor?: string,
  ): Promise<{ id: string; aprovacao: Aprovacao; kpis: AprovacoesKpis }> {
    const { data } = await http.put<{
      id: string
      aprovacao: Aprovacao
      kpis: AprovacoesKpis
    }>(`/api/chefe/aprovacoes/${id}/aprovar`, {
      decidido_por: decididoPor,
    })
    return data
  },

  async rejeitar(
    id: string,
    motivo: string,
    decididoPor?: string,
  ): Promise<{ id: string; aprovacao: Aprovacao; kpis: AprovacoesKpis }> {
    const { data } = await http.put<{
      id: string
      aprovacao: Aprovacao
      kpis: AprovacoesKpis
    }>(`/api/chefe/aprovacoes/${id}/rejeitar`, {
      motivo_rejeicao: motivo,
      decidido_por: decididoPor,
    })
    return data
  },
}