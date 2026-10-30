// src/services/gestmul/exportacao.service.ts
import http from '@/boot/axios'

export type TipoExportacao =
  | 'multas'
  | 'pagamentos'
  | 'contestacoes'
  | 'veiculos'
  | 'apolices'

export type FormatoExportacao = 'csv' | 'xlsx' | 'pdf' | 'json'

export interface ExportacaoBackend {
  id: string
  codigo: string
  tipo: string
  formato: string
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

export interface ExportacaoRecente {
  id: string
  codigo: string
  tipo: string
  formato: FormatoExportacao
  titulo: string
  detalhe: string
  data: string
  tamanho: string
  tamanhoBytes: number
  totalRegistos: number
  criadoPor: string
}

export interface CriarExportacaoPayload {
  tipo: string
  formato: string
  titulo: string
  detalhe?: string | undefined
  data_de?: string | null | undefined
  data_ate?: string | null | undefined
  incluir_cabecalho?: boolean | undefined
  incluir_resumo?: boolean | undefined
  apenas_ativos?: boolean | undefined
  total_registos?: number | undefined
  tamanho_bytes?: number | undefined
}

export interface GerarXlsxPayload {
  titulo: string
  cabecalhos: string[]
  linhas: (string | number)[][]
  resumo?: Record<string, string | number> | undefined
}

export interface GerarPdfPayload {
  titulo: string
  subtitulo?: string | undefined
  cabecalhos: string[]
  linhas: (string | number)[][]
  resumo?: Record<string, string | number> | undefined
}

export const exportacaoService = {
  async listar(): Promise<{ items: ExportacaoBackend[] }> {
    const { data } = await http.get<{ items: ExportacaoBackend[] }>(
      '/api/exportacoes',
    )
    return data
  },

  async registar(
    payload: CriarExportacaoPayload,
  ): Promise<{ id: string; codigo: string }> {
    const { data } = await http.post<{ id: string; codigo: string }>(
      '/api/exportacoes',
      payload,
    )
    return data
  },

  async remover(id: string): Promise<{ ok: boolean }> {
    const { data } = await http.delete<{ ok: boolean }>(
      `/api/exportacoes/${id}`,
    )
    return data
  },

  async gerarXlsx(payload: GerarXlsxPayload): Promise<Blob> {
    const { data } = await http.post('/api/exportacoes/xlsx', payload, {
      responseType: 'blob',
      headers: {
        Accept:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    })
    return data as Blob
  },

  async gerarPdf(payload: GerarPdfPayload): Promise<Blob> {
    const { data } = await http.post('/api/exportacoes/pdf', payload, {
      responseType: 'blob',
      headers: { Accept: 'application/pdf' },
    })
    return data as Blob
  },
}