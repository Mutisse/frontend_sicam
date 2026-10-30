// src/services/admin/dispositivos.service.ts
import http from '@/boot/axios'

export type EstadoDispositivo = 'Ativo' | 'Por registar'

export interface Dispositivo {
  id: string
  serie: string
  modelo: string
  agente: string
  estado: EstadoDispositivo
  versaoApp: string
  ultimaSincronizacao: string
  ultimaSincronizacaoTs: number | null
  notas?: string | null
}

export interface DispositivosKpis {
  total: number
  activos: number
  porRegistar: number
  desatualizados: number
}

export interface RespostaDispositivos {
  items: Dispositivo[]
  kpis: DispositivosKpis
  versao: string
}

export interface CriarDispositivoPayload {
  serie: string
  modelo: string
  agente?: string | undefined
  notas?: string | undefined
}

export interface ActualizarDispositivoPayload {
  serie?: string | undefined
  modelo?: string | undefined
  agente?: string | undefined
  notas?: string | undefined
}

export const dispositivosService = {
  async listar(): Promise<RespostaDispositivos> {
    const { data } = await http.get<RespostaDispositivos>(
      '/api/admin/dispositivos',
    )
    return data
  },

  async obter(id: string): Promise<Dispositivo> {
    const { data } = await http.get<Dispositivo>(
      `/api/admin/dispositivos/${id}`,
    )
    return data
  },

  async criar(
    payload: CriarDispositivoPayload,
  ): Promise<{
    id: string
    dispositivo: Dispositivo
    kpis: DispositivosKpis
  }> {
    const { data } = await http.post<{
      id: string
      dispositivo: Dispositivo
      kpis: DispositivosKpis
    }>('/api/admin/dispositivos', payload)
    return data
  },

  async actualizar(
    id: string,
    payload: ActualizarDispositivoPayload,
  ): Promise<{
    id: string
    dispositivo: Dispositivo
    kpis: DispositivosKpis
  }> {
    const { data } = await http.put<{
      id: string
      dispositivo: Dispositivo
      kpis: DispositivosKpis
    }>(`/api/admin/dispositivos/${id}`, payload)
    return data
  },

  async remover(id: string): Promise<{ ok: boolean; kpis: DispositivosKpis }> {
    const { data } = await http.delete<{
      ok: boolean
      kpis: DispositivosKpis
    }>(`/api/admin/dispositivos/${id}`)
    return data
  },

  async marcarAtualizado(
    id: string,
  ): Promise<{
    id: string
    dispositivo: Dispositivo
    kpis: DispositivosKpis
  }> {
    const { data } = await http.put<{
      id: string
      dispositivo: Dispositivo
      kpis: DispositivosKpis
    }>(`/api/admin/dispositivos/${id}/actualizar-versao`)
    return data
  },

  async desassociar(
    id: string,
  ): Promise<{
    id: string
    dispositivo: Dispositivo
    kpis: DispositivosKpis
  }> {
    const { data } = await http.put<{
      id: string
      dispositivo: Dispositivo
      kpis: DispositivosKpis
    }>(`/api/admin/dispositivos/${id}/desassociar`)
    return data
  },

  async exportarXlsx(): Promise<Blob> {
    const { data } = await http.get('/api/admin/dispositivos/xlsx', {
      responseType: 'blob',
      headers: {
        Accept:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    })
    return data as Blob
  },
}