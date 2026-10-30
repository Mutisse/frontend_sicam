// src/services/admin/monitorizacao.service.ts
import http from '@/boot/axios'

export type Nivel = 'regular' | 'atencao' | 'critico'
export type NivelAlerta = 'atencao' | 'critico' | 'info'

export interface KpiRecurso {
  key: string
  label: string
  icon: string
  valor: number
  unidade: string
  percentagem: number
  nivel: Nivel
  detalhe: string
  limiarAtencao: number
  limiarCritico: number
  historico: number[]
}

export interface Integracao {
  nome: string
  descricao: string
  icon: string
  estado: Nivel
  latencia: number
  ultimaResposta: string
  paradoDesde: string | null
}

export interface MetricasSistema {
  uptime: string
  uptimeDesde: string
  pedidosMin: number
  picoPedidos: number
  tempoMedio: number
  cacheHit: number
}

export interface Alerta {
  id: string
  nivel: NivelAlerta
  icon: string
  titulo: string
  descricao: string
  hora: string
  silenciado: boolean
  origem: string
  referencia: string | null
}

export interface RespostaMonitorizacao {
  recursos: {
    cpu: KpiRecurso
    ram: KpiRecurso
    disco: KpiRecurso
    latencia: KpiRecurso
  }
  integracoes: Integracao[]
  metricas: MetricasSistema
  alertas: Alerta[]
  estadoGeral: Nivel
  actualizadoEm: string
}

export const monitorizacaoService = {
  async obter(): Promise<RespostaMonitorizacao> {
    const { data } = await http.get<RespostaMonitorizacao>(
      '/api/admin/monitorizacao',
    )
    return data
  },

  async silenciarAlerta(id: string): Promise<{ ok: boolean }> {
    const { data } = await http.put<{ ok: boolean }>(
      `/api/admin/monitorizacao/alertas/${id}/silenciar`,
    )
    return data
  },

  async limparSilenciados(): Promise<{ ok: boolean }> {
    const { data } = await http.delete<{ ok: boolean }>(
      '/api/admin/monitorizacao/alertas/silenciados',
    )
    return data
  },

  async reiniciarIntegracao(nome: string): Promise<{ ok: boolean }> {
    const { data } = await http.post<{ ok: boolean }>(
      `/api/admin/monitorizacao/integracoes/${encodeURIComponent(nome)}/reiniciar`,
    )
    return data
  },
}