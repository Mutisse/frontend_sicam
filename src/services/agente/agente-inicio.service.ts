// src/services/agente/agente-inicio.service.ts
import http from '@/boot/axios'

export interface Kpis {
  consultas: number
  criticos: number
  autos: number
}

export interface VeiculoConsultado {
  matricula: string
  posto: string
  ultima: string
  tempo: string
  score: number
}

export interface VeiculoHotlist {
  matricula: string
  posto: string
  ultima: string
  tempo: string
  score: number
  motivo: string
  perigo: string
}

export interface Patrulha {
  codigo: string
  nome: string
  total: number
  progresso: number
  tempo: string
}

export interface RespostaInicio {
  kpis: Kpis
  veiculos: VeiculoConsultado[]
  requerAtencao: VeiculoHotlist[]
  patrulha: Patrulha | null
  dataHora: string
}

export interface RegistarConsultaPayload {
  matricula: string
  posto?: string | undefined
  score?: number | undefined
}

export const agenteInicioService = {
  async obter(): Promise<RespostaInicio> {
    const { data } = await http.get<RespostaInicio>('/api/agente/inicio')
    return data
  },

  async registarConsulta(payload: RegistarConsultaPayload): Promise<{
    ok: boolean
    matricula: string
    contador: number
  }> {
    const { data } = await http.post<{
      ok: boolean
      matricula: string
      contador: number
    }>('/api/agente/consultas/registar', payload)
    return data
  },
}