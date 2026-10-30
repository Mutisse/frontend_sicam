// src/services/admin/integracoes.service.ts
import http from '@/boot/axios'

export type EstadoIntegracao = 'regular' | 'atencao' | 'critico'
export type TomDesempenho = 'regular' | 'atencao'

export interface Integracao {
  nome: string
  descricao: string
  icon: string
  estado: EstadoIntegracao
  latencia: number
  ultimaResposta: string
}

export interface DesempenhoItem {
  icon: string
  label: string
  valor: string
  sub: string
  barra: number
  tom: TomDesempenho
}

export interface RespostaIntegracoes {
  integracoes: Integracao[]
  desempenho: DesempenhoItem[]
  meta: number
  escala: number
  ultimaActualizacao: string
}

export const integracoesService = {
  async listar(): Promise<RespostaIntegracoes> {
    const { data } = await http.get<RespostaIntegracoes>(
      '/api/admin/integracoes',
    )
    return data
  },
}