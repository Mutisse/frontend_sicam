// src/services/gestmul/contestacoes.service.ts
import http from '@/boot/axios'

export type EstadoContestacao =
  | 'Pendente'
  | 'Em análise'
  | 'Aceite'
  | 'Rejeitada'
  | 'Cancelada'

export type MotivoContestacao =
  | 'Erro de identificação do veículo'
  | 'Multa duplicada'
  | 'Não era o condutor'
  | 'Veículo vendido'
  | 'Erro de dados na multa'
  | 'Prescrição'
  | 'Outro'

export type PrioridadeContestacao = 'Baixa' | 'Média' | 'Alta'

export interface Contestacao {
  id: string
  numero: string
  multaCodigo: string
  matricula: string
  infracao: string
  valorMulta: number
  contestante: string
  nif: string
  contacto: string
  motivo: MotivoContestacao
  descricao: string
  prioridade: PrioridadeContestacao
  dataSubmissao: string
  prazoLimite: string
  estado: EstadoContestacao
  decisao?: string | null | undefined
  decisaoEm?: string | null | undefined
  decisaoPor?: string | null | undefined
  observacoes?: string | null | undefined
  criadoEm: string
}

export interface ContestacoesKpis {
  total: number
  pendentes: number
  emAnalise: number
  aceites: number
  rejeitadas: number
  canceladas: number
  valorEmCausa: number
  aExpirar: number
}

export interface RespostaContestacoes {
  items: Contestacao[]
  kpis: ContestacoesKpis
}

export interface CriarContestacaoPayload {
  numero?: string | undefined
  multaCodigo: string
  matricula: string
  infracao?: string | undefined
  valorMulta?: number | undefined
  contestante: string
  nif: string
  contacto?: string | undefined
  motivo: MotivoContestacao
  descricao: string
  prioridade?: PrioridadeContestacao | undefined
  prazoLimite: string
  estado?: EstadoContestacao | undefined
  observacoes?: string | undefined
}

export interface DecidirPayload {
  tipo: 'Aceite' | 'Rejeitada'
  fundamento: string
  responsavel: string
}

export const contestacoesService = {
  async listar(): Promise<RespostaContestacoes> {
    const { data } = await http.get<RespostaContestacoes>(
      '/api/gestmul/contestacoes',
    )
    return data
  },

  async criar(
    payload: CriarContestacaoPayload,
  ): Promise<{ id: string; contestacao: Contestacao; kpis: ContestacoesKpis }> {
    const { data } = await http.post<{
      id: string
      contestacao: Contestacao
      kpis: ContestacoesKpis
    }>('/api/gestmul/contestacoes', payload)
    return data
  },

  async obter(id: string): Promise<Contestacao> {
    const { data } = await http.get<Contestacao>(
      `/api/gestmul/contestacoes/${id}`,
    )
    return data
  },

  async actualizar(
    id: string,
    payload: Partial<CriarContestacaoPayload>,
  ): Promise<{ id: string; contestacao: Contestacao; kpis: ContestacoesKpis }> {
    const { data } = await http.put<{
      id: string
      contestacao: Contestacao
      kpis: ContestacoesKpis
    }>(`/api/gestmul/contestacoes/${id}`, payload)
    return data
  },

  async remover(id: string): Promise<{ ok: boolean; kpis: ContestacoesKpis }> {
    const { data } = await http.delete<{
      ok: boolean
      kpis: ContestacoesKpis
    }>(`/api/gestmul/contestacoes/${id}`)
    return data
  },

  async marcarEmAnalise(
    id: string,
  ): Promise<{ id: string; contestacao: Contestacao; kpis: ContestacoesKpis }> {
    const { data } = await http.put<{
      id: string
      contestacao: Contestacao
      kpis: ContestacoesKpis
    }>(`/api/gestmul/contestacoes/${id}/em-analise`)
    return data
  },

  async cancelar(
    id: string,
  ): Promise<{ id: string; contestacao: Contestacao; kpis: ContestacoesKpis }> {
    const { data } = await http.put<{
      id: string
      contestacao: Contestacao
      kpis: ContestacoesKpis
    }>(`/api/gestmul/contestacoes/${id}/cancelar`)
    return data
  },

  async decidir(
    id: string,
    payload: DecidirPayload,
  ): Promise<{ id: string; contestacao: Contestacao; kpis: ContestacoesKpis }> {
    const { data } = await http.post<{
      id: string
      contestacao: Contestacao
      kpis: ContestacoesKpis
    }>(`/api/gestmul/contestacoes/${id}/decidir`, payload)
    return data
  },

  async exportarXlsx(): Promise<Blob> {
    const { data } = await http.get('/api/gestmul/contestacoes/xlsx', {
      responseType: 'blob',
      headers: {
        Accept:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    })
    return data as Blob
  },

  async exportarPdf(): Promise<Blob> {
    const { data } = await http.get('/api/gestmul/contestacoes/pdf', {
      responseType: 'blob',
      headers: { Accept: 'application/pdf' },
    })
    return data as Blob
  },
}