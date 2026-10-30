// src/services/gestmul/relatorios.service.ts
import http from '@/boot/axios'

export type PeriodoRapido = '7d' | '30d' | '90d' | 'ano' | 'personalizado'

export interface KpisRelatorio {
  emitidas: number
  pagas: number
  pendentes: number
  contestadas: number
  cobrado: number
  pendenteValor: number
  ticketMedio: number
  taxaCobranca: number
}

export interface ValorMensal {
  mes: string
  emitidas: number
  cobrado: number
}

export interface TopInfracao {
  nome: string
  total: number
  percentagem: number
}

export interface TopMetodo {
  metodo: string
  total: number
  percentagem: number
}

export interface DesempenhoProvincia {
  provincia: string
  emitidas: number
  pagas: number
  cobrado: number
  taxa: number
}

export interface TotaisProvincias {
  emitidas: number
  pagas: number
  cobrado: number
}

export interface RespostaRelatorio {
  periodo: {
    de: string
    ate: string
    provincia: string
  }
  kpis: KpisRelatorio
  cobrancaMensal: ValorMensal[]
  topInfracoes: TopInfracao[]
  topMetodos: TopMetodo[]
  desempenhoProvincia: DesempenhoProvincia[]
  totaisProvincias: TotaisProvincias
}

export interface FiltrosRelatorio {
  de?: string
  ate?: string
  provincia?: string
}

export const relatoriosService = {
  async obter(filtros: FiltrosRelatorio = {}): Promise<RespostaRelatorio> {
    const { data } = await http.get<RespostaRelatorio>(
      '/api/relatorios/gestmul',
      { params: filtros },
    )
    return data
  },

  async exportarXlsx(filtros: FiltrosRelatorio = {}): Promise<Blob> {
    const { data } = await http.get('/api/relatorios/gestmul/xlsx', {
      params: filtros,
      responseType: 'blob',
      headers: {
        Accept:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    })
    return data as Blob
  },

  async exportarPdf(filtros: FiltrosRelatorio = {}): Promise<Blob> {
    const { data } = await http.get('/api/relatorios/gestmul/pdf', {
      params: filtros,
      responseType: 'blob',
      headers: { Accept: 'application/pdf' },
    })
    return data as Blob
  },
}