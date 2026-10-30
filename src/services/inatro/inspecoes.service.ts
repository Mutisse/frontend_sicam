// src/services/inatro/inspecoes.service.ts
import http from '@/boot/axios'

// ============================================================
// Tipos — checklist
// ============================================================
export type ChecklistTipo =
  | 'booleano'
  | 'decimal'
  | 'numero'
  | 'texto'
  | 'opcoes'

export interface ChecklistCampo {
  chave: string
  label: string
  tipo: ChecklistTipo
  opcoes: string[] | null
  min: number | null
  max: number | null
  invertido: boolean
  so_se_gasolina: boolean
  so_se_diesel: boolean
  unidade: string | null
  ordem: number
}

export interface ChecklistSeccao {
  chave: string
  label: string
  ordem: number
  campos: ChecklistCampo[]
}

// ============================================================
// Tipos — inspeções
// ============================================================
export interface InspecaoMeta {
  aprovados: number
  falhas: number
  total: number
}

export interface Inspecao {
  id: string
  codigo: string
  veiculo_id: string
  matricula: string
  marca: string
  modelo: string
  ano: number | null
  cor: string
  chassis: string
  proprietario: string
  nif: string
  data: string
  data_raw: string | null
  validade: string
  proximaInspecao: string
  tipo: string
  resultado: string
  estado: string
  posto: string
  inspetor: string
  observacoes: string | null
  checklist: Record<string, any>
  meta: InspecaoMeta | null
}

export interface InspecoesKpis {
  total: number
  aprovadas: number
  reprovadas: number
  pendentes: number
  taxaAprovacao: number
}

export interface RespostaInspecoes {
  items: Inspecao[]
  kpis: InspecoesKpis
}

export interface CriarInspecaoPayload {
  veiculo_id: number | string
  posto_id?: number | string | undefined
  posto?: string | undefined
  data: string
  tipo?: string | undefined
  resultado?: string | undefined
  inspetor: string
  observacoes?: string | undefined
  checklist?: Record<string, any> | undefined
}

// ============================================================
// Service
// ============================================================
export const inspecoesService = {
  async listar(): Promise<RespostaInspecoes> {
    const { data } = await http.get<RespostaInspecoes>('/api/inspecoes')
    return data
  },

  async kpis(): Promise<InspecoesKpis> {
    const { data } = await http.get<InspecoesKpis>('/api/inspecoes/kpis')
    return data
  },

  async checklist(): Promise<ChecklistSeccao[]> {
    const { data } = await http.get<ChecklistSeccao[]>('/api/checklist')
    return data
  },

  async criar(
    payload: CriarInspecaoPayload,
  ): Promise<{
    id: string
    codigo: string
    meta: InspecaoMeta
    kpis: InspecoesKpis
  }> {
    const { data } = await http.post<{
      id: string
      codigo: string
      meta: InspecaoMeta
      kpis: InspecoesKpis
    }>('/api/inspecoes', payload)
    return data
  },

  async obter(id: string): Promise<Inspecao> {
    const { data } = await http.get<Inspecao>(`/api/inspecoes/${id}`)
    return data
  },

  async veiculosPendentes(): Promise<any[]> {
    const { data } = await http.get<{ items: any[] }>('/api/veiculos', {
      params: { pendentes: 1 },
    })
    return data.items ?? []
  },
}