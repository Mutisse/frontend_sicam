// src/services/hotlist.service.ts
import http from '@/boot/axios'

// ============================================================
// Tipos
// ============================================================
export type NivelHotlist = 'Alto' | 'Médio' | 'Baixo'
export type EstadoHotlist = 'Ativo' | 'Resolvido'
export type OrigemHotlist = 'PRM' | 'INATRO' | 'GESTMUL' | 'ISSM'
export type MotivoHotlist = 'Furtado' | 'Clonagem suspeita' | 'Mandado de captura'

export interface VeiculoHotlist {
  id: string
  matricula: string
  marca: string
  modelo: string
  cor: string
  motivo: MotivoHotlist
  nivel: NivelHotlist
  origem: OrigemHotlist
  dataInsercao: string
  horaInsercao: string
  local: string
  posto: string
  agente: string
  abordagens: number
  estado: EstadoHotlist
  observacoes?: string
}

export interface HotlistKpis {
  total: number
  furtados: number
  clonagem: number
  mandados: number
  altos: number
  ativos: number
}

export interface RespostaHotlist {
  items: VeiculoHotlist[]
  kpis: HotlistKpis
}

export interface CriarHotlistPayload {
  matricula: string
  motivo: MotivoHotlist
  perigo: 'alto' | 'medio' | 'baixo'
  descricao?: string | null
}

export interface AtualizarHotlistPayload {
  motivo?: MotivoHotlist
  perigo?: 'alto' | 'medio' | 'baixo'
  estado?: 'Activo' | 'Resolvido'
  descricao?: string | null
}

// ============================================================
// Serviço
// ============================================================
export const hotlistService = {
  /** GET /api/hotlist — lista + KPIs */
  async listar(): Promise<RespostaHotlist> {
    const { data } = await http.get<RespostaHotlist>('/api/hotlist')
    return data
  },

  /** POST /api/hotlist */
  async criar(payload: CriarHotlistPayload): Promise<void> {
    await http.post('/api/hotlist', payload)
  },

  /** PUT /api/hotlist/{id} */
  async actualizar(id: string, payload: AtualizarHotlistPayload): Promise<void> {
    await http.put(`/api/hotlist/${id}`, payload)
  },

  /** PUT /api/hotlist/{id}/resolver */
  async resolver(id: string): Promise<void> {
    await http.put(`/api/hotlist/${id}/resolver`)
  },

  /** DELETE /api/hotlist/{id} */
  async remover(id: string): Promise<void> {
    await http.delete(`/api/hotlist/${id}`)
  },
}