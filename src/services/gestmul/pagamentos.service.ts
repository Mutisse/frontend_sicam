// src/services/gestmul/pagamentos.service.ts
import http from '@/boot/axios'

export type EstadoPagamento = 'Confirmado' | 'Pendente' | 'Anulado'
export type MetodoPagamento =
  | 'Dinheiro'
  | 'Transferência'
  | 'Multibanco'
  | 'M-Pesa'

export interface Pagamento {
  id: string
  recibo: string
  matricula: string
  multaCodigo: string
  infracao: string
  metodo: MetodoPagamento
  data: string
  valor: number
  pagador: string
  referencia?: string | null | undefined
  estado: EstadoPagamento
  observacoes?: string | null | undefined
  criadoEm: string
}

export interface PagamentosKpis {
  total: number
  confirmados: number
  pendentes: number
  anulados: number
  valorConfirmado: number
  valorPendente: number
  valorTotal: number
  ticketMedio: number
}

export interface OpcoesFiltros {
  metodo: string[]
  estado: string[]
}

export interface RespostaPagamentos {
  items: Pagamento[]
  kpis: PagamentosKpis
  opcoes: OpcoesFiltros
}

export interface Recibo {
  numero: string
  data: string
  hora: string
  multaCodigo: string
  matricula: string
  infracao: string
  metodo: string
  pagador: string
  referencia?: string | null | undefined
  valor: number
}

export interface CriarPagamentoPayload {
  multaNumero: string
  metodo: MetodoPagamento
  pagador: string
  referencia?: string | undefined
  estado?: EstadoPagamento | undefined
  observacoes?: string | undefined
}

export interface ActualizarPagamentoPayload {
  metodo?: MetodoPagamento | undefined
  pagador?: string | undefined
  referencia?: string | undefined
  estado?: EstadoPagamento | undefined
  observacoes?: string | undefined
}

export const pagamentosService = {
  async listar(): Promise<RespostaPagamentos> {
    const { data } = await http.get<RespostaPagamentos>(
      '/api/gestmul/pagamentos',
    )
    return data
  },

  async obter(id: string): Promise<Pagamento> {
    const { data } = await http.get<Pagamento>(`/api/gestmul/pagamentos/${id}`)
    return data
  },

  async criar(
    payload: CriarPagamentoPayload,
  ): Promise<{ id: string; pagamento: Pagamento; kpis: PagamentosKpis }> {
    const { data } = await http.post<{
      id: string
      pagamento: Pagamento
      kpis: PagamentosKpis
    }>('/api/gestmul/pagamentos', payload)
    return data
  },

  async actualizar(
    id: string,
    payload: ActualizarPagamentoPayload,
  ): Promise<{ id: string; pagamento: Pagamento; kpis: PagamentosKpis }> {
    const { data } = await http.put<{
      id: string
      pagamento: Pagamento
      kpis: PagamentosKpis
    }>(`/api/gestmul/pagamentos/${id}`, payload)
    return data
  },

  async remover(id: string): Promise<{ ok: boolean; kpis: PagamentosKpis }> {
    const { data } = await http.delete<{ ok: boolean; kpis: PagamentosKpis }>(
      `/api/gestmul/pagamentos/${id}`,
    )
    return data
  },

  async confirmar(
    id: string,
  ): Promise<{ id: string; pagamento: Pagamento; kpis: PagamentosKpis }> {
    const { data } = await http.put<{
      id: string
      pagamento: Pagamento
      kpis: PagamentosKpis
    }>(`/api/gestmul/pagamentos/${id}/confirmar`)
    return data
  },

  async anular(
    id: string,
  ): Promise<{ id: string; pagamento: Pagamento; kpis: PagamentosKpis }> {
    const { data } = await http.put<{
      id: string
      pagamento: Pagamento
      kpis: PagamentosKpis
    }>(`/api/gestmul/pagamentos/${id}/anular`)
    return data
  },

  async reciboPdf(id: string): Promise<Blob> {
    const { data } = await http.get(
      `/api/gestmul/pagamentos/${id}/recibo/pdf`,
      {
        responseType: 'blob',
        headers: { Accept: 'application/pdf' },
      },
    )
    return data as Blob
  },

  async exportarXlsx(): Promise<Blob> {
    const { data } = await http.get('/api/gestmul/pagamentos/xlsx', {
      responseType: 'blob',
      headers: {
        Accept:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    })
    return data as Blob
  },
}