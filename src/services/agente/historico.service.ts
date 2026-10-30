// src/services/agente/historico.service.ts
import http from '@/boot/axios'

export type EstadoConsulta = 'critico' | 'atencao' | 'regular' | 'sem-dados'

export interface ConsultaHistorico {
  id: string
  matricula: string
  posto: string
  score: number | null
  estado: EstadoConsulta
  origem: 'manual' | 'camera' | 'historico'
  consultadoEm: string
  hora: string
  data: string
  dataHora: string
  diasAtras: number
}

export interface HistoricoKpis {
  total: number
  hoje: number
  criticos: number
  atencao: number
  regulares: number
}

export interface ListaHistoricoResposta {
  items: ConsultaHistorico[]
  total: number
  kpis: HistoricoKpis
}

export interface FiltrosHistorico {
  periodo?: 'hoje' | '7d' | '30d' | 'tudo'
  estado?: 'critico' | 'atencao' | 'regular' | 'sem-dados'
  q?: string
}

export const historicoService = {
  async listar(filtros: FiltrosHistorico = {}): Promise<ListaHistoricoResposta> {
    const { data } = await http.get<ListaHistoricoResposta>(
      '/api/agente/historico',
      { params: filtros },
    )
    return {
      items: data.items ?? [],
      total: data.total ?? 0,
      kpis: data.kpis ?? {
        total: 0,
        hoje: 0,
        criticos: 0,
        atencao: 0,
        regulares: 0,
      },
    }
  },

  async registar(
    matricula: string,
    origem: 'manual' | 'camera' | 'historico' = 'manual',
  ): Promise<ConsultaHistorico | null> {
    try {
      const { data } = await http.post<{ consulta: ConsultaHistorico }>(
        '/api/agente/historico',
        { matricula, origem },
      )
      return data.consulta
    } catch {
      return null // não bloqueia a consulta se falhar
    }
  },

  async exportarCsv(): Promise<Blob> {
    const { data } = await http.get('/api/agente/historico/xlsx', {
      responseType: 'blob',
      headers: { Accept: 'text/csv' },
    })
    return data as Blob
  },
}