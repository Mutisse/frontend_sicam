// src/services/inatro/relatorios.service.ts
import http from '@/boot/axios'

export interface RelatorioKpis {
  total: number
  validas: number
  expiradas: number
  pendentes: number
  aExpirar: number
  taxa: number
  tempoMedio: number
}

export interface RegistroMes {
  mes: string
  ym: string
  valor: number
}

export interface RegistroProvincia {
  nome: string
  valor: number
}

export interface TopMarca {
  marca: string
  veiculos: number
  percentagem: number
}

export interface TopInfracao {
  tipo: string
  total: number
  percentagem: number
}

export interface InspecaoPosto {
  posto: string
  provincia: string
  realizadas: number
  aprovadas: number
  reprovadas: number
  taxa: number
}

export interface DashboardRelatorio {
  kpis: RelatorioKpis
  registosPorMes: RegistroMes[]
  registosPorProvincia: RegistroProvincia[]
  topMarcas: TopMarca[]
  topInfracoes: TopInfracao[]
  inspecoesPorPosto: InspecaoPosto[]
}

export interface FiltrosRelatorio {
  data_de?: string
  data_ate?: string
  provincia?: string
  posto?: string
}

export const relatoriosService = {
  async dashboard(filtros: FiltrosRelatorio = {}): Promise<DashboardRelatorio> {
    const { data } = await http.get<DashboardRelatorio>(
      '/api/relatorios/inatro/dashboard',   // ← URL atualizado
      { params: filtros },
    )
    return data
  },
}