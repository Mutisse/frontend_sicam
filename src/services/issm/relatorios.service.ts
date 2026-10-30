// src/services/issm/relatorios.service.ts
import http from '@/boot/axios'

export interface KpisRelatorio {
  apolicesActivas: number
  sinistrosAbertos: number
  taxaCobertura: number
  aExpirar: number
  premioMedio: number
  taxaSinistralidade: number
}

export interface ValorMensal {
  mes: string
  apolices: number
}

export interface ApolicesSeguradora {
  nome: string
  valor: number
  percentagem: number
}

export interface DesempenhoSeguradora {
  nome: string
  apolices: number
  sinistros: number
  taxa: number
  valorMedio: string
  estado: 'regular' | 'atencao' | 'critico'
  estadoLabel: string
}

export interface TopTipoSeguro {
  tipo: string
  apolices: number
  percentagem: number
}

export interface RespostaRelatorio {
  periodo: { de: string; ate: string }
  kpis: KpisRelatorio
  apolicesPorMes: ValorMensal[]
  apolicesPorSeguradora: ApolicesSeguradora[]
  desempenhoPorSeguradora: DesempenhoSeguradora[]
  topTipos: TopTipoSeguro[]
}

export interface FiltrosRelatorio {
  de?: string
  ate?: string
}

export const relatoriosService = {
  async obter(filtros: FiltrosRelatorio = {}): Promise<RespostaRelatorio> {
    const { data } = await http.get<RespostaRelatorio>('/api/relatorios/issm', {
      params: filtros,
    })
    return data
  },

  async exportarXlsx(filtros: FiltrosRelatorio = {}): Promise<Blob> {
    const { data } = await http.get('/api/relatorios/issm/xlsx', {
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
    const { data } = await http.get('/api/relatorios/issm/pdf', {
      params: filtros,
      responseType: 'blob',
      headers: { Accept: 'application/pdf' },
    })
    return data as Blob
  },
}