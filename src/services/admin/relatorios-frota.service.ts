// src/services/admin/relatorios-frota.service.ts
import http from '@/boot/axios'

export type EstadoOperacao = 'Planeada' | 'Concluída' | 'Cancelada' | 'Em curso'

export interface KpisFrota {
  operacoes: number
  concluidas: number
  taxaConclusao: string
  noPrazo: string
  distancia: string
  duracao: string
}

export interface Viatura {
  viatura: string
  operacoes: string
  gps: string
  odometro: string
  variacao: string
  variacaoNum: number
  anomalia: boolean
}

export interface Operacao {
  codigo: string
  tipo: string
  viatura: string
  agendada: string
  distancia: string
  estado: EstadoOperacao
  responsavel?: string | null | undefined
}

export interface OpcoesFrota {
  viaturas: string[]
  estados: string[]
}

export interface RespostaFrota {
  periodo: { de: string; ate: string }
  kpis: KpisFrota
  viaturas: Viatura[]
  operacoes: Operacao[]
  opcoes: OpcoesFrota
}

export interface FiltrosFrota {
  de?: string | undefined
  ate?: string | undefined
  viatura?: string | undefined
  estado?: string | undefined
}

export const relatoriosFrotaService = {
  async obter(filtros: FiltrosFrota = {}): Promise<RespostaFrota> {
    const { data } = await http.get<RespostaFrota>(
      '/api/admin/relatorios/frota',
      { params: filtros },
    )
    return data
  },

  async exportarXlsx(filtros: FiltrosFrota = {}): Promise<Blob> {
    const { data } = await http.get('/api/admin/relatorios/frota/xlsx', {
      params: filtros,
      responseType: 'blob',
      headers: {
        Accept:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    })
    return data as Blob
  },

  async exportarPdf(filtros: FiltrosFrota = {}): Promise<Blob> {
    const { data } = await http.get('/api/admin/relatorios/frota/pdf', {
      params: filtros,
      responseType: 'blob',
      headers: { Accept: 'application/pdf' },
    })
    return data as Blob
  },
}