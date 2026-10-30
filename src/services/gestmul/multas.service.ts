// src/services/gestmul/multas.service.ts
import http from '@/boot/axios'

export type EstadoMulta = 'Paga' | 'Pendente' | 'Contestada' | 'Anulada'
export type MetodoPagamento =
  | 'Dinheiro'
  | 'M-Pesa'
  | 'Transferência'
  | 'Multibanco'

export interface Multa {
  id: string
  codigo: string
  matricula: string
  marca: string
  modelo: string
  proprietario: string
  infracao: string
  agente: string
  posto: string
  local: string
  provincia: string
  data: string
  dataPagamento?: string | null | undefined
  valor: number
  estado: EstadoMulta
  observacoes?: string | null | undefined
  criadoEm: string
}

export interface MultasKpis {
  total: number
  pagas: number
  pendentes: number
  contestadas: number
  anuladas: number
  valorTotal: number
  valorPago: number
  valorPendente: number
}

export interface OpcoesFiltros {
  infracao: string[]
  agente: string[]
}

export interface RespostaMultas {
  items: Multa[]
  kpis: MultasKpis
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

export interface PagarPayload {
  metodo: MetodoPagamento
  pagador: string
  referencia?: string | undefined
}

export interface ActualizarMultaPayload {
  infracao?: string | undefined
  valor?: number | undefined
  estado?: EstadoMulta | undefined
  observacoes?: string | undefined
}

export const multasService = {
  async listar(): Promise<RespostaMultas> {
    const { data } = await http.get<RespostaMultas>('/api/gestmul/multas')
    return data
  },

  async obter(id: string): Promise<Multa> {
    const { data } = await http.get<Multa>(`/api/gestmul/multas/${id}`)
    return data
  },

  async actualizar(
    id: string,
    payload: ActualizarMultaPayload,
  ): Promise<{ id: string; multa: Multa; kpis: MultasKpis }> {
    const { data } = await http.put<{
      id: string
      multa: Multa
      kpis: MultasKpis
    }>(`/api/gestmul/multas/${id}`, payload)
    return data
  },

  async remover(id: string): Promise<{ ok: boolean; kpis: MultasKpis }> {
    const { data } = await http.delete<{ ok: boolean; kpis: MultasKpis }>(
      `/api/gestmul/multas/${id}`,
    )
    return data
  },

  async contestar(
    id: string,
  ): Promise<{ id: string; multa: Multa; kpis: MultasKpis }> {
    const { data } = await http.put<{
      id: string
      multa: Multa
      kpis: MultasKpis
    }>(`/api/gestmul/multas/${id}/contestar`)
    return data
  },

  async anular(
    id: string,
  ): Promise<{ id: string; multa: Multa; kpis: MultasKpis }> {
    const { data } = await http.put<{
      id: string
      multa: Multa
      kpis: MultasKpis
    }>(`/api/gestmul/multas/${id}/anular`)
    return data
  },

  async pagar(
    id: string,
    payload: PagarPayload,
  ): Promise<{ multa: Multa; recibo: Recibo; kpis: MultasKpis }> {
    const { data } = await http.post<{
      multa: Multa
      recibo: Recibo
      kpis: MultasKpis
    }>(`/api/gestmul/multas/${id}/pagar`, payload)
    return data
  },

  async reciboPdf(id: string): Promise<Blob> {
    const { data } = await http.get(`/api/gestmul/multas/${id}/recibo/pdf`, {
      responseType: 'blob',
      headers: { Accept: 'application/pdf' },
    })
    return data as Blob
  },

  async exportarXlsx(): Promise<Blob> {
    const { data } = await http.get('/api/gestmul/multas/xlsx', {
      responseType: 'blob',
      headers: {
        Accept:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    })
    return data as Blob
  },
}