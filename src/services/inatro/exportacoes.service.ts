// src/services/inatro/exportacoes.service.ts
import http from '@/boot/axios'

export type TipoExportacao = 'veiculos' | 'inspecoes' | 'agendamentos' | 'completo'
export type FormatoExportacao = 'csv' | 'json' | 'xlsx' | 'pdf'

export interface Exportacao {
  id: string
  codigo: string
  tipo: TipoExportacao
  formato: FormatoExportacao
  titulo: string
  detalhe: string | null
  data_de: string | null
  data_ate: string | null
  incluir_cabecalho: boolean
  incluir_resumo: boolean
  apenas_ativos: boolean
  total_registos: number
  tamanho_bytes: number
  criadoEm: string
  criadoPor: string
}

export interface CriarExportacaoPayload {
  tipo: TipoExportacao
  formato: FormatoExportacao
  titulo: string
  detalhe?: string | undefined
  data_de?: string | undefined
  data_ate?: string | undefined
  incluir_cabecalho?: boolean | undefined
  incluir_resumo?: boolean | undefined
  apenas_ativos?: boolean | undefined
  total_registos?: number | undefined
  tamanho_bytes?: number | undefined
}

// Payload para gerar ficheiros no backend
export interface GerarFicheiroPayload {
  titulo: string
  subtitulo?: string | undefined
  cabecalhos: string[]
  linhas: string[][]
  resumo?: Record<string, any> | undefined
}

export const exportacoesService = {
  // ------------------------------------------------------
  // Listar / criar / remover (histórico)
  // ------------------------------------------------------
  async listar(): Promise<{ items: Exportacao[] }> {
    const { data } = await http.get<{ items: Exportacao[] }>('/api/exportacoes')
    return data
  },

  async criar(
    payload: CriarExportacaoPayload,
  ): Promise<{ id: string; codigo: string }> {
    const { data } = await http.post<{ id: string; codigo: string }>(
      '/api/exportacoes',
      payload,
    )
    return data
  },

  async remover(id: string): Promise<{ ok: boolean }> {
    const { data } = await http.delete<{ ok: boolean }>(`/api/exportacoes/${id}`)
    return data
  },

  // ------------------------------------------------------
  // Gerar ficheiros no backend
  // ------------------------------------------------------
  async gerarXlsx(payload: GerarFicheiroPayload): Promise<Blob> {
    const { data } = await http.post('/api/exportacoes/xlsx', payload, {
      responseType: 'blob',
      headers: {
        Accept:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    })
    return data as Blob
  },

  async gerarPdf(payload: GerarFicheiroPayload): Promise<Blob> {
    const { data } = await http.post('/api/exportacoes/pdf', payload, {
      responseType: 'blob',
      headers: {
        Accept: 'application/pdf',
      },
    })
    return data as Blob
  },
}