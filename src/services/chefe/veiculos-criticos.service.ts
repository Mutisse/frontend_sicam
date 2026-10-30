// src/services/chefe/veiculos-criticos.service.ts
import http from '@/boot/axios'

export type MotivoCritico =
  | 'Hotlist PRM'
  | 'Seguro expirado'
  | 'Inspecção em atraso'
  | 'Multas em atraso'
  | 'Documentação irregular'
  | 'Veículo roubado'
  | 'Suspeita de clonagem'

export type PrioridadeCritico = 'Baixa' | 'Média' | 'Alta' | 'Urgente'
export type EstadoCritico = 'Activo' | 'Em averiguação' | 'Resolvido' | 'Arquivado'

export interface RegistoHistorico {
  data: string
  acao: string
  responsavel: string
}

export interface VeiculoCritico {
  id: string
  matricula: string
  marca: string
  modelo: string
  proprietario: string
  nif: string
  telefone: string
  motivo: MotivoCritico
  prioridade: PrioridadeCritico
  estado: EstadoCritico
  posto: string
  zona: string
  agente: string
  ultimaOcorrencia: string
  multasPendentes: number
  valorMultas: number
  observacoes: string | null
  historico: RegistoHistorico[]
  criadoEm: string
}

export interface VeiculosCriticosKpis {
  total: number
  hotlist: number
  seguroExpirado: number
  emAveriguacao: number
  urgentes: number
  resolvidos: number
}

export interface RespostaVeiculosCriticos {
  items: VeiculoCritico[]
  kpis: VeiculosCriticosKpis
}

export interface CriarVeiculoCriticoPayload {
  matricula: string
  marca: string
  modelo: string
  proprietario: string
  nif: string
  telefone?: string | undefined
  motivo: string
  prioridade: PrioridadeCritico
  estado?: EstadoCritico | undefined
  posto?: string | undefined
  zona?: string | undefined
  agente?: string | undefined
  multas_pendentes?: number | undefined
  valor_multas?: number | undefined
  observacoes?: string | undefined
}

export interface FiltrosExport {
  motivo?: string
  prioridade?: string
  estado?: string
  posto?: string
}

export const veiculosCriticosService = {
  // ------------------------------------------------------
  // CRUD
  // ------------------------------------------------------
  async listar(): Promise<RespostaVeiculosCriticos> {
    const { data } = await http.get<RespostaVeiculosCriticos>('/api/chefe/veiculos-criticos')
    return data
  },

  async criar(payload: CriarVeiculoCriticoPayload): Promise<{ id: string; veiculo: VeiculoCritico }> {
    const { data } = await http.post<{ id: string; veiculo: VeiculoCritico }>(
      '/api/chefe/veiculos-criticos',
      payload,
    )
    return data
  },

  async obter(id: string): Promise<VeiculoCritico> {
    const { data } = await http.get<VeiculoCritico>(`/api/chefe/veiculos-criticos/${id}`)
    return data
  },

  async actualizar(
    id: string,
    payload: Partial<CriarVeiculoCriticoPayload>,
  ): Promise<{ id: string; veiculo: VeiculoCritico }> {
    const { data } = await http.put<{ id: string; veiculo: VeiculoCritico }>(
      `/api/chefe/veiculos-criticos/${id}`,
      payload,
    )
    return data
  },

  async remover(id: string): Promise<{ ok: boolean }> {
    const { data } = await http.delete<{ ok: boolean }>(`/api/chefe/veiculos-criticos/${id}`)
    return data
  },

  // ------------------------------------------------------
  // Ações
  // ------------------------------------------------------
  async abaterHotlist(id: string): Promise<{ id: string; veiculo: VeiculoCritico }> {
    const { data } = await http.put<{ id: string; veiculo: VeiculoCritico }>(
      `/api/chefe/veiculos-criticos/${id}/abater-hotlist`,
    )
    return data
  },

  async regularizarSeguro(id: string): Promise<{ id: string; veiculo: VeiculoCritico }> {
    const { data } = await http.put<{ id: string; veiculo: VeiculoCritico }>(
      `/api/chefe/veiculos-criticos/${id}/regularizar-seguro`,
    )
    return data
  },

  // ------------------------------------------------------
  // Exportar
  // ------------------------------------------------------
  async exportarXlsx(filtros: FiltrosExport = {}): Promise<Blob> {
    const { data } = await http.get('/api/chefe/veiculos-criticos/xlsx', {
      params: filtros,
      responseType: 'blob',
      headers: {
        Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    })
    return data as Blob
  },

  async exportarPdf(filtros: FiltrosExport = {}): Promise<Blob> {
    const { data } = await http.get('/api/chefe/veiculos-criticos/pdf', {
      params: filtros,
      responseType: 'blob',
      headers: { Accept: 'application/pdf' },
    })
    return data as Blob
  },
}