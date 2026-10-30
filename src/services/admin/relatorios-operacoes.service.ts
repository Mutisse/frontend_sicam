// src/services/admin/relatorios-operacoes.service.ts
import http from '@/boot/axios'

export type EstadoOperacao = 'Concluída' | 'Cancelada' | 'Planeada' | 'Em curso'

export interface Operacao {
  codigo: string
  tipo: string
  viatura: string
  posto: string
  agendada: string
  data: string
  estado: EstadoOperacao
}

export interface Viatura {
  viatura: string
  posto: string
  operacoesTotal: number
  operacoesConcluidas: number
}

export interface SeriePonto {
  data: string
  label: string
  valor: number
}

export interface PostoBar {
  nome: string
  valor: number
  percentagem: number
}

export interface DistEstado {
  estado: string
  valor: number
  percent: number
}

export interface KpisOperacoes {
  operacoes: number
  concluidas: number
  canceladas: number
  taxa: number
}

export interface RespostaOperacoes {
  periodo: { de: string | null; ate: string | null }
  kpis: KpisOperacoes
  serieDias: SeriePonto[]
  porPosto: PostoBar[]
  distEstado: DistEstado[]
  operacoes: Operacao[]
  viaturas: Viatura[]
  postos: string[]
}

export interface FiltrosOperacoes {
  de?: string | undefined
  ate?: string | undefined
  posto?: string | undefined
}

export const relatoriosOperacoesService = {
  async obter(filtros: FiltrosOperacoes = {}): Promise<RespostaOperacoes> {
    const { data } = await http.get<RespostaOperacoes>(
      '/api/admin/relatorios/operacoes',
      { params: filtros },
    )
    return data
  },

  async exportarXlsx(filtros: FiltrosOperacoes = {}): Promise<Blob> {
    const { data } = await http.get(
      '/api/admin/relatorios/operacoes/xlsx',
      {
        params: filtros,
        responseType: 'blob',
        headers: {
          Accept:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
      },
    )
    return data as Blob
  },

  async exportarPdf(filtros: FiltrosOperacoes = {}): Promise<Blob> {
    const { data } = await http.get('/api/admin/relatorios/operacoes/pdf', {
      params: filtros,
      responseType: 'blob',
      headers: { Accept: 'application/pdf' },
    })
    return data as Blob
  },
}