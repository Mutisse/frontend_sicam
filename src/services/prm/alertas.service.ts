// src/services/alertas.service.ts
import http from '@/boot/axios'

export type NivelAlerta = 'critico' | 'atencao' | 'info'
export type TipoAlerta = 'hotlist' | 'clonagem' | 'sinistro' | 'sistema'

export interface Alerta {
  id: string
  nivel: NivelAlerta
  tipo: TipoAlerta
  titulo: string
  mensagem: string
  hora: string
  referencia?: string | null
  origem?: string | null
  lido: boolean
  criadoEm: string
}

export interface AlertasKpis {
  criticos: number
  atencao: number
  info: number
  lidos: number
  total: number
}

export interface RespostaAlertas {
  items: Alerta[]
  kpis: AlertasKpis
}

export const alertasService = {
  async listar(): Promise<RespostaAlertas> {
    const { data } = await http.get<RespostaAlertas>('/api/alertas')
    return data
  },

  async marcarLido(id: string): Promise<void> {
    await http.put(`/api/alertas/${id}/ler`)
  },

  async marcarNaoLido(id: string): Promise<void> {
    await http.put(`/api/alertas/${id}/nao-lido`)
  },

  async marcarTodosLidos(): Promise<{ total: number }> {
    const { data } = await http.put<{ total: number }>('/api/alertas/ler-todos')
    return data
  },
}