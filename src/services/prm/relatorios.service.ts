// src/services/relatorios.service.ts
import http from '@/boot/axios'

export type Nivel = 'alto' | 'medio' | 'baixo'

export interface KpiVisivel {
  variant: 'critico' | 'atencao' | 'regular' | 'info' | 'neutral'
  icon: string
  valor: string | number
  unidade?: string
  label: string
  sub?: string
  percentagem?: number
  trend?: { tipo: 'up' | 'down'; valor: string }
}

export interface DesempenhoPosto {
  posto: string
  provincia: string
  abordagens: number
  detencoes: number
  autos: number
  taxa: number
}

export interface MatriculaAbordada {
  matricula: string
  motivo: string
  abordagens: number
  nivel: Nivel
}

export interface RelatorioPrm {
  kpis: {
    hotlistActiva: number
    abordagens30d: number
    detencoes: number
    resolvidos: number
    emAberto: number
    taxaResolucao: number
    tempoMedio: number
  }
  kpisVisiveis: KpiVisivel[]
  linha: {
    valores: number[]
    labels: string[]
  }
  anel: {
    taxa: number
    resolvidos: number
    emAberto: number
  }
  hotlistPorMotivo: {
    nome: string
    valor: number
    cor: string
    percentagem: number
  }[]
  desempenhoPorPosto: DesempenhoPosto[]
  topMatriculas: MatriculaAbordada[]
}

export const relatoriosService = {
  async prm(de?: string, ate?: string): Promise<RelatorioPrm> {
    const params: Record<string, string> = {}
    if (de) params.de = de
    if (ate) params.ate = ate

    const { data } = await http.get<RelatorioPrm>('/api/relatorios/prm', { params })
    return data
  },
}