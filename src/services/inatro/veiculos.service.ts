// src/services/inatro/veiculos.service.ts
import http from '@/boot/axios'

export interface Veiculo {
  id: string
  matricula: string
  tipo: string
  marca: string
  modelo: string
  ano?: number | null
  cor: string
  combustivel: string
  chassis: string
  proprietario: string
  nif: string
  posto: string
  provincia: string
  score: number
  estado: 'critico' | 'atencao' | 'regular' | 'sem-dados'
  data: string
}

export interface VeiculosKpis {
  registados: number
  inspecaoOk: number
  inspecaoExp: number
  pendentes: number
}

export interface RespostaVeiculos {
  items: Veiculo[]
  kpis: VeiculosKpis
}

export interface CriarVeiculoPayload {
  matricula: string
  tipo: string
  marca: string
  modelo: string
  ano: number
  cor: string
  combustivel?: string | undefined
  chassis?: string | undefined
  proprietario: string
  nif: string
  telefone?: string | undefined
  provincia: string
  endereco?: string | undefined
  posto: string
}

export const veiculosService = {
  async listar(): Promise<RespostaVeiculos> {
    const { data } = await http.get<RespostaVeiculos>('/api/veiculos')
    return data
  },

  async criar(
    payload: CriarVeiculoPayload,
  ): Promise<{ id: string; kpis: VeiculosKpis }> {
    const { data } = await http.post<{ id: string; kpis: VeiculosKpis }>(
      '/api/veiculos',
      payload,
    )
    return data
  },

  async obter(id: string): Promise<Veiculo> {
    const { data } = await http.get<Veiculo>(`/api/veiculos/${id}`)
    return data
  },
}