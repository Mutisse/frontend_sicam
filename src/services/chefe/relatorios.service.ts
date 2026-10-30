// src/services/chefe/relatorios.service.ts
import http from '@/boot/axios'

export interface RelatorioKpis {
  consultas: number
  autos: number
  abordagens: number
  conformidade: number
  conformes: number
  naoConformes: number
}

export interface ValorDiario {
  dia: string
  consultas: number
}

export interface ConsultaAgente {
  nome: string
  valor: number
  percentagem: number
}

export interface DesempenhoAgente {
  nome: string
  consultas: number
  autos: number
  abordagens: number
  regularidade: number
}

export interface ResumoPatrulha {
  codigo: string
  data: string
  agente: string
  duracao: string
  veiculos: string
  estado: string
  estadoClasse: 'regular' | 'atencao' | 'critico' | 'neutral'
}

export interface RelatorioChefe {
  kpis: RelatorioKpis
  consultasPorDia: ValorDiario[]
  consultasPorAgente: ConsultaAgente[]
  desempenhoPorAgente: DesempenhoAgente[]
  resumoPatrulhas: ResumoPatrulha[]
}

export interface FiltrosRelatorio {
  data_de?: string
  data_ate?: string
}

export const relatoriosChefeService = {
  async obter(filtros: FiltrosRelatorio = {}): Promise<RelatorioChefe> {
    const { data } = await http.get<RelatorioChefe>('/api/relatorios/chefe', {
      params: filtros,
    })
    return data
  },

  async exportarXlsx(filtros: FiltrosRelatorio = {}): Promise<Blob> {
    const { data } = await http.get('/api/relatorios/chefe/xlsx', {
      params: filtros,
      responseType: 'blob',
      headers: {
        Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    })
    return data as Blob
  },

  async exportarPdf(filtros: FiltrosRelatorio = {}): Promise<Blob> {
    const { data } = await http.get('/api/relatorios/chefe/pdf', {
      params: filtros,
      responseType: 'blob',
      headers: {
        Accept: 'application/pdf',
      },
    })
    return data as Blob
  },
}